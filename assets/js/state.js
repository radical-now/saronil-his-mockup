/* ==========================================================================
   SARONIL HMS - CENTRAL SHARED STATE ENGINE (state.js)
   ========================================================================== */

window.showToast = function(message, type = 'success') {
  let container = document.getElementById('global-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-toast-container';
    container.style.position = 'fixed';
    container.style.top = '24px';
    container.style.right = '24px';
    container.style.zIndex = '99999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.style.background = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#f59e0b');
  toast.style.color = '#ffffff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '8px';
  toast.style.fontSize = '0.82rem';
  toast.style.fontWeight = '700';
  toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(-20px)';
  toast.style.transition = 'all 0.3s ease';
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
};
window.showToastNotification = window.showToast;

window.ipdSafeRender = function(container, html) {
  const activeEl = document.activeElement;
  let activeId = activeEl ? activeEl.id : null;
  let selectionStart = null;
  let selectionEnd = null;

  if (activeId && activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    try {
      selectionStart = activeEl.selectionStart;
      selectionEnd = activeEl.selectionEnd;
    } catch (e) {}
  }

  container.innerHTML = html;

  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) {
      el.focus();
      if (selectionStart !== null && selectionEnd !== null) {
        try {
          el.setSelectionRange(selectionStart, selectionEnd);
        } catch (e) {}
      }
    }
  }
};

function generate2000Medicines() {
  const categories = [
    {
      name: "Cardiovascular",
      icd10: "I10",
      icdTitle: "Essential (primary) hypertension",
      generics: [
        { name: "Telmisartan", brands: ["Telma", "Telpres", "Telsar"], strengths: ["20mg", "40mg", "80mg"], form: "Tablet", route: "Oral", priceRange: [8, 15] },
        { name: "Amlodipine", brands: ["Amlopres", "Amlopin", "Stamlo"], strengths: ["2.5mg", "5mg", "10mg"], form: "Tablet", route: "Oral", priceRange: [3, 8] },
        { name: "Metoprolol", brands: ["Metolar", "Starpress", "Supermet"], strengths: ["25mg", "50mg", "100mg"], form: "Tablet", route: "Oral", priceRange: [12, 25] },
        { name: "Atorvastatin", brands: ["Atorva", "Lipvas", "Tonact"], strengths: ["10mg", "20mg", "40mg", "80mg"], form: "Tablet", route: "Oral", priceRange: [15, 45] },
        { name: "Rosuvastatin", brands: ["Rosuvas", "Razel", "Crevast"], strengths: ["5mg", "10mg", "20mg", "40mg"], form: "Tablet", route: "Oral", priceRange: [18, 50] },
        { name: "Clopidogrel", brands: ["Clopilet", "Plavix", "Deplatt"], strengths: ["75mg", "150mg"], form: "Tablet", route: "Oral", priceRange: [10, 20] },
        { name: "Ramipril", brands: ["Cardace", "Ramipres", "Hopace"], strengths: ["2.5mg", "5mg", "10mg"], form: "Tablet", route: "Oral", priceRange: [6, 14] },
        { name: "Losartan", brands: ["Covance", "Losacar", "Tozaar"], strengths: ["25mg", "50mg", "100mg"], form: "Tablet", route: "Oral", priceRange: [5, 12] }
      ]
    },
    {
      name: "Antidiabetics",
      icd10: "E11",
      icdTitle: "Type 2 diabetes mellitus",
      generics: [
        { name: "Metformin", brands: ["Glycomet", "Obimet", "Metfogamma"], strengths: ["500mg", "850mg", "1000mg"], form: "Tablet", route: "Oral", priceRange: [4, 10] },
        { name: "Glimepiride", brands: ["Glimy", "Amaryl", "Gp"], strengths: ["1mg", "2mg", "3mg", "4mg"], form: "Tablet", route: "Oral", priceRange: [6, 18] },
        { name: "Sitagliptin", brands: ["Januvia", "Istavel", "Sita"], strengths: ["50mg", "100mg"], form: "Tablet", route: "Oral", priceRange: [25, 60] },
        { name: "Vildagliptin", brands: ["Galvus", "Jalra", "Vildamax"], strengths: ["50mg", "100mg"], form: "Tablet", route: "Oral", priceRange: [15, 35] },
        { name: "Dapagliflozin", brands: ["Forxiga", "Oxra", "Dapa"], strengths: ["5mg", "10mg"], form: "Tablet", route: "Oral", priceRange: [30, 75] },
        { name: "Teneligliptin", brands: ["Tenepride", "Teneza", "Teniva"], strengths: ["20mg", "40mg"], form: "Tablet", route: "Oral", priceRange: [10, 22] }
      ]
    },
    {
      name: "Analgesics & NSAIDs",
      icd10: "R52",
      icdTitle: "Pain, unspecified",
      generics: [
        { name: "Paracetamol", brands: ["Dolo", "Calpol", "Crocin"], strengths: ["500mg", "650mg"], form: "Tablet", route: "Oral", priceRange: [2, 5] },
        { name: "Aceclofenac", brands: ["Zerodol", "Aceclo", "Hifenac"], strengths: ["100mg", "200mg"], form: "Tablet", route: "Oral", priceRange: [5, 12] },
        { name: "Diclofenac", brands: ["Voveran", "Dynapar", "Reactin"], strengths: ["50mg", "75mg", "100mg"], form: "Tablet", route: "Oral", priceRange: [4, 15] },
        { name: "Ibuprofen", brands: ["Brufen", "Ibugesic", "Ibumax"], strengths: ["200mg", "400mg", "600mg"], form: "Tablet", route: "Oral", priceRange: [3, 8] },
        { name: "Etoricoxib", brands: ["Nucoxia", "Etoshine", "Ecox"], strengths: ["60mg", "90mg", "120mg"], form: "Tablet", route: "Oral", priceRange: [10, 25] },
        { name: "Tramadol", brands: ["Tramazac", "Contramal", "Supridol"], strengths: ["50mg", "100mg"], form: "Capsule", route: "Oral", priceRange: [8, 18] }
      ]
    },
    {
      name: "Antibiotics",
      icd10: "A49",
      icdTitle: "Bacterial infection, unspecified",
      generics: [
        { name: "Amoxicillin + Clavulanate", brands: ["Augmentin", "Clavam", "Moxikind-CV"], strengths: ["375mg", "625mg", "1000mg"], form: "Tablet", route: "Oral", priceRange: [15, 30] },
        { name: "Azithromycin", brands: ["Azee", "Azithral", "Zithrox"], strengths: ["250mg", "500mg"], form: "Tablet", route: "Oral", priceRange: [12, 28] },
        { name: "Cefixime", brands: ["Taxim-O", "Zifi", "Ceftas"], strengths: ["100mg", "200mg", "400mg"], form: "Tablet", route: "Oral", priceRange: [10, 25] },
        { name: "Ciprofloxacin", brands: ["Cifran", "Ciplox", "Cipro"], strengths: ["250mg", "500mg"], form: "Tablet", route: "Oral", priceRange: [6, 14] },
        { name: "Ofloxacin", brands: ["Oflox", "Zenflox", "Oflomac"], strengths: ["200mg", "400mg"], form: "Tablet", route: "Oral", priceRange: [8, 16] },
        { name: "Doxycycline", brands: ["Doxy-1", "Lenteclin", "Microdox"], strengths: ["100mg"], form: "Capsule", route: "Oral", priceRange: [4, 9] }
      ]
    },
    {
      name: "Gastrointestinal",
      icd10: "K21",
      icdTitle: "Gastro-esophageal reflux disease",
      generics: [
        { name: "Pantoprazole", brands: ["Pantocid", "Pan", "Pantodac"], strengths: ["20mg", "40mg"], form: "Tablet", route: "Oral", priceRange: [8, 15] },
        { name: "Rabeprazole", brands: ["Rablet", "Rabicip", "Veloz"], strengths: ["20mg", "40mg"], form: "Tablet", route: "Oral", priceRange: [10, 18] },
        { name: "Omeprazole", brands: ["Omez", "Omee", "Omecip"], strengths: ["20mg", "40mg"], form: "Capsule", route: "Oral", priceRange: [4, 10] },
        { name: "Ondansetron", brands: ["Emeset", "Ondem", "Zofran"], strengths: ["4mg", "8mg"], form: "Tablet", route: "Oral", priceRange: [5, 10] },
        { name: "Domperidone", brands: ["Domstal", "Dompan", "Motinorm"], strengths: ["10mg", "30mg"], form: "Tablet", route: "Oral", priceRange: [4, 8] }
      ]
    },
    {
      name: "Respiratory",
      icd10: "J45",
      icdTitle: "Asthma",
      generics: [
        { name: "Montelukast", brands: ["Montair", "Montek", "Montina"], strengths: ["5mg", "10mg"], form: "Tablet", route: "Oral", priceRange: [10, 18] },
        { name: "Levocetirizine", brands: ["L-Hist", "Teczine", "Levocet"], strengths: ["5mg", "10mg"], form: "Tablet", route: "Oral", priceRange: [3, 8] },
        { name: "Fexofenadine", brands: ["Allegra", "Fexo", "Altiva"], strengths: ["120mg", "180mg"], form: "Tablet", route: "Oral", priceRange: [15, 25] },
        { name: "Budesonide", brands: ["Budecort", "Pulmicort", "Budair"], strengths: ["100mcg", "200mcg", "400mcg"], form: "Inhaler", route: "Inhalation", priceRange: [150, 350] },
        { name: "Salbutamol", brands: ["Asthalin", "Ventorlin", "Salbair"], strengths: ["2mg", "4mg"], form: "Tablet", route: "Oral", priceRange: [2, 5] }
      ]
    },
    {
      name: "Neuro-Psychiatry",
      icd10: "F41",
      icdTitle: "Other anxiety disorders",
      generics: [
        { name: "Escitalopram", brands: ["Nexito", "Cipralex", "Estitalo"], strengths: ["5mg", "10mg", "20mg"], form: "Tablet", route: "Oral", priceRange: [8, 20] },
        { name: "Clonazepam", brands: ["Lonazep", "Petril", "Clonefit"], strengths: ["0.25mg", "0.5mg", "1mg", "2mg"], form: "Tablet", route: "Oral", priceRange: [4, 12] },
        { name: "Alprazolam", brands: ["Alprax", "Restyl", "Zolax"], strengths: ["0.25mg", "0.5mg", "1mg"], form: "Tablet", route: "Oral", priceRange: [3, 9] },
        { name: "Gabapentin", brands: ["Gabapin", "Gabator", "Pentabin"], strengths: ["100mg", "300mg", "400mg"], form: "Tablet", route: "Oral", priceRange: [15, 35] },
        { name: "Pregabalin", brands: ["Lyrica", "Pregabid", "Maxgalin"], strengths: ["75mg", "150mg", "300mg"], form: "Capsule", route: "Oral", priceRange: [20, 55] }
      ]
    },
    {
      name: "Vitamins & Supplements",
      icd10: "E63",
      icdTitle: "Other nutritional deficiencies",
      generics: [
        { name: "Cholecalciferol (Vit D3)", brands: ["Calcirol", "D3-Must", "Uprise-D3"], strengths: ["60K IU", "1K IU", "2K IU"], form: "Capsule", route: "Oral", priceRange: [10, 30] },
        { name: "Methylcobalamin (Vit B12)", brands: ["Nurokind-OD", "Meconerve", "Rejunex"], strengths: ["500mcg", "1500mcg"], form: "Tablet", route: "Oral", priceRange: [8, 22] },
        { name: "Calcium Carbonate", brands: ["Shelcal", "Calcicad", "Ostocalcium"], strengths: ["250mg", "500mg"], form: "Tablet", route: "Oral", priceRange: [5, 12] },
        { name: "Ferrous Ascorbate", brands: ["Orofer-XT", "Fefol", "Cheri-XT"], strengths: ["100mg"], form: "Tablet", route: "Oral", priceRange: [8, 16] },
        { name: "Folic Acid", brands: ["Folvite", "Foliage", "Fol-5"], strengths: ["5mg"], form: "Tablet", route: "Oral", priceRange: [1, 4] }
      ]
    }
  ];

  const manufacturers = ["Micro Labs Ltd", "Cipla Ltd", "Sun Pharmaceutical Industries", "Abbott India Ltd", "Lupin Ltd", "Alkem Laboratories", "Torrent Pharmaceuticals", "Intas Pharmaceuticals", "Zydus Lifesciences", "Dr. Reddy's Laboratories", "GSK India", "Pfizer India"];
  const list = [];
  let index = 1;

  // Explicitly seed Dolo 650 as code PH-001 for backward compatibility
  list.push({
    code: "PH-001",
    name: "Dolo 650",
    brandName: "Dolo 650",
    genericName: "Paracetamol",
    saltComposition: "Paracetamol 650mg",
    strength: "650mg",
    dosageForm: "Tablet",
    route: "Oral",
    manufacturer: "Micro Labs Ltd",
    packSize: "Strip of 15",
    stock: 500,
    minStock: 50,
    price: 15,
    expiry: "2028-12-01",
    category: "Analgesics & NSAIDs",
    icd10: "R52",
    icdTitle: "Pain, unspecified",
    locations: { "Main Pharmacy": 200, "Emergency Pharmacy": 50, "IPD Pharmacy": 100, "OT Pharmacy": 50, "Satellite Pharmacy": 100 },
    pregnancyCategory: "B",
    lactationSafety: "Safe",
    kidneySafety: "No dose adjustment required",
    liverSafety: "Use with caution.",
    expiringSoon: false,
    coPrescribed: []
  });
  index++;

  while (list.length < 2000) {
    const cat = categories[index % categories.length];
    const gen = cat.generics[index % cat.generics.length];
    const brand = gen.brands[index % gen.brands.length] + " " + gen.strengths[index % gen.strengths.length];
    const strength = gen.strengths[index % gen.strengths.length];
    const mfg = manufacturers[index % manufacturers.length];
    const code = "PH-" + String(index).padStart(3, "0");
    const dosage = gen.form;
    const route = gen.route;
    
    // Calculate a price
    const basePrice = gen.priceRange[0] + (index % (gen.priceRange[1] - gen.priceRange[0] + 1));
    
    list.push({
      code: code,
      name: brand,
      brandName: brand,
      genericName: gen.name,
      saltComposition: `${gen.name} ${strength}`,
      strength: strength,
      dosageForm: dosage,
      route: route,
      manufacturer: mfg,
      packSize: dosage === "Inhaler" ? "1 Inhaler" : (dosage === "Ointment" ? "Tube of 15g" : "Strip of 10"),
      stock: 100 + (index % 900),
      minStock: 50,
      price: basePrice,
      expiry: `2028-${String((index % 12) + 1).padStart(2, "0")}-01`,
      category: cat.name,
      icd10: cat.icd10,
      icdTitle: cat.icdTitle,
      locations: { "Main Pharmacy": 50, "Emergency Pharmacy": 10, "IPD Pharmacy": 20, "OT Pharmacy": 10, "Satellite Pharmacy": 10 },
      pregnancyCategory: "B",
      lactationSafety: "Safe",
      kidneySafety: "No dose adjustment required",
      liverSafety: "Use with caution.",
      expiringSoon: false,
      coPrescribed: []
    });
    
    index++;
  }
  return list;
}

const DOCTORS_DATABASE = [
  { id: "DOC01", name: "Dr. Srinivasan", spec: "General Medicine", room: "101", phone: "+91 98450 11021", status: "Active", regNo: "KMC-48902" },
  { id: "DOC02", name: "Dr. Ramesh Iyer", spec: "Pediatrics", room: "102", phone: "+91 98450 11022", status: "Active", regNo: "KMC-55921" },
  { id: "DOC03", name: "Dr. Krishnamurthy", spec: "Psychiatry", room: "103", phone: "+91 98450 11023", status: "Active", regNo: "KMC-60211" },
  { id: "DOC04", name: "Dr. Mehta", spec: "General Surgery", room: "104", phone: "+91 98450 11024", status: "Active", regNo: "MCI-40912" },
  { id: "DOC05", name: "Dr. Priya Nair", spec: "Gynecology & Obs", room: "105", phone: "+91 98450 11025", status: "Active", regNo: "KMC-77291" },
  { id: "DOC06", name: "Dr. Fatima Sheikh", spec: "Emergency Medicine", room: "106", phone: "+91 98450 11026", status: "Active", regNo: "MCI-88902" },
  { id: "DOC07", name: "Dr. Anand", spec: "Cardiology", room: "107", phone: "+91 98450 11027", status: "Active", regNo: "MCI-30219" },
  { id: "DOC08", name: "Dr. Abhishek Kumar", spec: "Cardiology", room: "108", phone: "+91 98450 11028", status: "Active", regNo: "MCI-33452" },
  { id: "DOC09", name: "Dr. Sunita Sharma", spec: "Cardiology", room: "109", phone: "+91 98450 11029", status: "Active", regNo: "MCI-44581" },
  { id: "DOC10", name: "Dr. Amit Patel", spec: "Pediatrics", room: "110", phone: "+91 98450 11030", status: "Active", regNo: "KMC-88123" },
  { id: "DOC11", name: "Dr. Mamta Kumari", spec: "Pediatrics", room: "111", phone: "+91 98450 11031", status: "Active", regNo: "KMC-89332" },
  { id: "DOC12", name: "Dr. Rajesh Singh", spec: "General Medicine", room: "112", phone: "+91 98450 11032", status: "Active", regNo: "KMC-90312" },
  { id: "DOC13", name: "Dr. Devanti Devi", spec: "General Medicine", room: "113", phone: "+91 98450 11033", status: "Active", regNo: "KMC-91404" },
  { id: "DOC14", name: "Dr. Munna Kumar", spec: "Orthopedics", room: "114", phone: "+91 98450 11034", status: "Active", regNo: "MCI-55429" },
  { id: "DOC15", name: "Dr. Sarah Jenkins", spec: "Orthopedics", room: "115", phone: "+91 98450 11035", status: "Active", regNo: "MCI-66291" },
  { id: "DOC16", name: "Dr. Arvind Prasad", spec: "Gynecology & Obs", room: "116", phone: "+91 98450 11036", status: "Active", regNo: "KMC-99882" },
  { id: "DOC17", name: "Dr. Preeti Reddy", spec: "Gynecology & Obs", room: "117", phone: "+91 98450 11037", status: "Active", regNo: "KMC-99001" },
  { id: "DOC18", name: "Dr. Ajay Kumar", spec: "Neurology", room: "118", phone: "+91 98450 11038", status: "Active", regNo: "MCI-70334" },
  { id: "DOC19", name: "Dr. Shrawan Kumar", spec: "Oncology", room: "119", phone: "+91 98450 11039", status: "Active", regNo: "MCI-80299" },
  { id: "DOC20", name: "Dr. Vijay Pipil", spec: "Dermatology", room: "120", phone: "+91 98450 11040", status: "Active", regNo: "MCI-90452" }
];

// Generate 10 additional clinical doctors (DOC21 to DOC30)
(function() {
  const clinicalDepts = [
    "General Medicine", "Pediatrics", "Cardiology", "Orthopedics", "Gynecology & Obs",
    "Emergency Medicine", "Neurology", "Oncology", "Dermatology", "Gastroenterology"
  ];
  const docNames = [
    "Dr. Rajesh Varma", "Dr. Shalini Sen", "Dr. Vikram Seth", "Dr. Ananya Roy", "Dr. David Miller",
    "Dr. Kavitha Rao", "Dr. Manoj Nair", "Dr. Sarah Paul", "Dr. Arjun Saxena", "Dr. Sneha Patil"
  ];
  for (let i = 0; i < 10; i++) {
    DOCTORS_DATABASE.push({
      id: `DOC${21 + i}`,
      name: docNames[i],
      spec: clinicalDepts[i % clinicalDepts.length],
      room: String(121 + i),
      phone: `+91 98450 110${41 + i}`,
      status: "Active",
      regNo: `KMC-${78000 + i}`
    });
  }
})();

const state = {
  alerts: JSON.parse(localStorage.getItem('saronil_alerts')) || [
    { id: "ALT101", severity: "Critical Safety Alert", patientName: "Aarav Sharma", uhid: "UH-2026-000001", details: "Potential Sepsis detected: NEWS2 Score = 8 (High Risk). Attending notified.", source: "Clinical Vitals", clinician: "Nurse Mary", time: "18-Jul-2026 10:15 AM", status: "Active", eStatus: "Open" },
    { id: "ALT102", severity: "Hard Stop", patientName: "Priya Nair", uhid: "UH-2026-000002", details: "Drug-Drug Conflict: Potassium Chloride (PH-001) ordered with Spironolactone. High Risk of Hyperkalemia.", source: "Pharmacy Order", clinician: "Dr. Srinivasan", time: "18-Jul-2026 10:30 AM", status: "Active", eStatus: "Open" },
    { id: "ALT103", severity: "Warning", patientName: "Sanjay Sen", uhid: "UH-2026-000003", details: "Panic Lab Value: Serum Potassium = 6.2 mEq/L (Critical High). Attending notified.", source: "Laboratory Integration", clinician: "Tech Amit", time: "18-Jul-2026 10:45 AM", status: "Active", eStatus: "Open" }
  ],
  alertsAuditTrail: JSON.parse(localStorage.getItem('saronil_alertsAuditTrail')) || [],
  // 1. Doctors Database (20+ Specialists)
  // Nurses and staff definitions
  nurses: (function() {
    const baseNurses = [
      { id: "NUR01", name: "Staff Nurse Mary", dept: "General Medicine", shift: "Morning", phone: "+91 98450 22001", status: "Active" },
      { id: "NUR02", name: "Staff Nurse John", dept: "Cardiology", shift: "Morning", phone: "+91 98450 22002", status: "Active" },
      { id: "NUR03", name: "Staff Nurse Sarah", dept: "Pediatrics", shift: "Afternoon", phone: "+91 98450 22003", status: "Active" },
      { id: "NUR04", name: "Staff Nurse Robert", dept: "Emergency Medicine", shift: "Night", phone: "+91 98450 22004", status: "Active" },
      { id: "NUR05", name: "Staff Nurse Jessica", dept: "Gynecology & Obs", shift: "Morning", phone: "+91 98450 22005", status: "Active" },
      { id: "NUR06", name: "Staff Nurse David", dept: "General Surgery", shift: "Afternoon", phone: "+91 98450 22006", status: "Active" },
      { id: "NUR07", name: "Staff Nurse Karen", dept: "Neurology", shift: "Morning", phone: "+91 98450 22007", status: "Active" },
      { id: "NUR08", name: "Staff Nurse James", dept: "Oncology", shift: "Night", phone: "+91 98450 22008", status: "Active" },
      { id: "NUR09", name: "Staff Nurse Emily", dept: "Gastroenterology", shift: "Afternoon", phone: "+91 98450 22009", status: "Active" },
      { id: "NUR10", name: "Staff Nurse Michael", dept: "Daycare", shift: "Morning", phone: "+91 98450 22010", status: "Active" }
    ];
    const depts = [
      "General Medicine", "Pediatrics", "Cardiology", "Orthopedics", "Gynecology & Obs",
      "Emergency Medicine", "Neurology", "Oncology", "Dermatology", "Gastroenterology", "Daycare", "General Wards"
    ];
    const shifts = ["Morning", "Afternoon", "Night"];
    const nurseFirstNames = ["Aisha", "Bindu", "Carol", "Deepa", "Elsa", "Fiona", "Gauri", "Hina", "Indu", "Jaya", "Kiran", "Lata", "Meera", "Nisha", "Omana", "Pooja", "Ritu", "Seema", "Tina", "Uma"];
    const nurseLastNames = ["Sharma", "Nair", "Iyer", "Kumar", "Singh", "Patel", "Reddy", "Pillai", "Sen", "Roy"];
    
    for (let i = 0; i < 60; i++) {
      const firstName = nurseFirstNames[i % nurseFirstNames.length];
      const lastName = nurseLastNames[(i + 3) % nurseLastNames.length];
      const name = `Staff Nurse ${firstName} ${lastName}`;
      baseNurses.push({
        id: `NUR${11 + i}`,
        name: name,
        dept: depts[i % depts.length],
        shift: shifts[i % shifts.length],
        phone: `+91 98450 22${100 + i}`,
        status: "Active"
      });
    }
    return baseNurses;
  })(),
  staff: (function() {
    const baseStaff = [
      { id: "STF01", name: "Ph. Satish Kumar", role: "Pharmacist", dept: "Pharmacy", shift: "Morning", phone: "+91 98450 33001" },
      { id: "STF02", name: "Ph. Anita Rao", role: "Pharmacist", dept: "Pharmacy", shift: "Afternoon", phone: "+91 98450 33002" },
      { id: "STF03", name: "Tech Amit Verma", role: "Lab Technician", dept: "Laboratory", shift: "Morning", phone: "+91 98450 33003" },
      { id: "STF04", name: "Tech Preeti Reddy", role: "Lab Technician", dept: "Laboratory", shift: "Afternoon", phone: "+91 98450 33004" },
      { id: "STF05", name: "Clerk Anand", role: "Billing Clerk", dept: "Billing", shift: "Morning", phone: "+91 98450 33005" },
      { id: "STF06", name: "Clerk Sunita", role: "Billing Clerk", dept: "Billing", shift: "Afternoon", phone: "+91 98450 33006" },
      { id: "STF07", name: "Rec. Ravi", role: "Receptionist", dept: "Front Desk", shift: "Morning", phone: "+91 98450 33007" },
      { id: "STF08", name: "Rec. Priya", role: "Receptionist", dept: "Front Desk", shift: "Afternoon", phone: "+91 98450 33008" },
      { id: "STF09", name: "Clerk Shalini", role: "Admission Assistant", dept: "Admission Desk", shift: "Morning", phone: "+91 98450 33009" },
      { id: "STF10", name: "Clerk Ajay", role: "Admission Assistant", dept: "Admission Desk", shift: "Afternoon", phone: "+91 98450 33010" }
    ];
    const nonClinicalRoles = [
      { role: "Billing Clerk", dept: "Billing" },
      { role: "Receptionist", dept: "Front Desk" },
      { role: "Admission Assistant", dept: "Admission Desk" },
      { role: "Pharmacist", dept: "Pharmacy" },
      { role: "Lab Technician", dept: "Laboratory" },
      { role: "Radiology Tech", dept: "Radiology" },
      { role: "OT Assistant", dept: "Operation Theatre" },
      { role: "IT Support", dept: "IT Administration" }
    ];
    const shifts = ["Morning", "Afternoon", "Night", "General"];
    const staffFirstNames = ["Amit", "Rohan", "Sanjay", "Vikram", "Ketan", "Rahul", "Sameer", "Vijay", "Anand", "Rajesh", "Priya", "Sunita", "Anjali", "Kavita", "Ritu", "Sita", "Geeta", "Babita", "Mamta", "Rekha"];
    const staffLastNames = ["Verma", "Reddy", "Sharma", "Nair", "Iyer", "Kumar", "Singh", "Patel", "Sen", "Roy"];
    
    for (let i = 0; i < 30; i++) {
      const roleObj = nonClinicalRoles[i % nonClinicalRoles.length];
      const firstName = staffFirstNames[i % staffFirstNames.length];
      const lastName = staffLastNames[(i + 7) % staffLastNames.length];
      const prefix = roleObj.role.includes("Pharmacist") ? "Ph." : (roleObj.role.includes("Technician") || roleObj.role.includes("Tech") ? "Tech" : "Clerk");
      const name = `${prefix} ${firstName} ${lastName}`;
      baseStaff.push({
        id: `STF${11 + i}`,
        name: name,
        role: roleObj.role,
        dept: roleObj.dept,
        shift: shifts[i % shifts.length],
        phone: `+91 98450 33${100 + i}`,
        status: "Active"
      });
    }
    return baseStaff;
  })(),
  doctors: JSON.parse(localStorage.getItem('saronil_doctors')) || DOCTORS_DATABASE,

  // 2. Wards & Beds configuration
  wards: {
    "GENERAL-WARD-M": {
      name: "General Ward (Male)",
      beds: [
        "GWM-101-B1", "GWM-101-B2", "GWM-101-B3", "GWM-101-B4", "GWM-101-B5", "GWM-101-B6", "GWM-101-B7", "GWM-101-B8",
        "GWM-102-B1", "GWM-102-B2", "GWM-102-B3", "GWM-102-B4", "GWM-102-B5", "GWM-102-B6", "GWM-102-B7", "GWM-102-B8"
      ],
      price: 1200
    },
    "GENERAL-WARD-F": {
      name: "General Ward (Female)",
      beds: [
        "GWF-103-B1", "GWF-103-B2", "GWF-103-B3", "GWF-103-B4", "GWF-103-B5", "GWF-103-B6", "GWF-103-B7", "GWF-103-B8",
        "GWF-104-B1", "GWF-104-B2", "GWF-104-B3", "GWF-104-B4", "GWF-104-B5", "GWF-104-B6", "GWF-104-B7", "GWF-104-B8"
      ],
      price: 1200
    },
    "SEMI-PRIVATE": {
      name: "Semi-Private Ward",
      beds: [
        "SP-201-A", "SP-201-B", "SP-202-A", "SP-202-B", "SP-203-A", "SP-203-B",
        "SP-204-A", "SP-204-B", "SP-205-A", "SP-205-B", "SP-206-A", "SP-206-B"
      ],
      price: 2800
    },
    "PRIVATE": {
      name: "Private Room",
      beds: [
        "PVT-301", "PVT-302", "PVT-303", "PVT-304", "PVT-305", "PVT-306", "PVT-307", "PVT-308", "PVT-309", "PVT-310"
      ],
      price: 5500
    },
    "DELUXE": {
      name: "Deluxe Suite",
      beds: ["DLX-401", "DLX-402", "DLX-403", "DLX-404"],
      price: 11000
    },
    "HDU": {
      name: "High Dependency Unit (HDU)",
      beds: ["HDU-B1", "HDU-B2", "HDU-B3", "HDU-B4", "HDU-B5", "HDU-B6", "HDU-B7", "HDU-B8"],
      price: 6500
    },
    "ICU": {
      name: "ICU / Critical Care Unit",
      beds: ["ICU-B1", "ICU-B2", "ICU-B3", "ICU-B4", "ICU-B5", "ICU-B6", "ICU-B7", "ICU-B8"],
      price: 10000
    },
    "CCU": {
      name: "Critical Care Unit",
      beds: ["CCU-B1", "CCU-B2", "CCU-B3", "CCU-B4", "CCU-B5", "CCU-B6"],
      price: 11000
    },
    "ICCU": {
      name: "Intensive Cardiac Care Unit",
      beds: ["ICCU-B1", "ICCU-B2", "ICCU-B3", "ICCU-B4", "ICCU-B5", "ICCU-B6"],
      price: 12000
    },
    "EMERGENCY": {
      name: "Emergency Ward",
      beds: [
        "ER-1-B1", "ER-1-B2", "ER-1-B3", "ER-1-B4", "ER-1-B5", "ER-1-B6",
        "ER-2-BAY1", "ER-2-BAY2", "ER-2-BAY3", "ER-2-BAY4", "ER-2-BAY5", "ER-2-BAY6"
      ],
      price: 3500
    },
    "DAYCARE": {
      name: "Daycare Unit",
      beds: [
        "DC-BED-1", "DC-BED-2", "DC-BED-3", "DC-BED-4", "DC-BED-5", "DC-BED-6",
        "DC-CHAIR-1", "DC-CHAIR-2", "DC-CHAIR-3", "DC-CHAIR-4", "DC-CHAIR-5", "DC-CHAIR-6"
      ],
      price: 1800
    }
  },

  // Bed status allocations (populated on startup or dynamically modified)
  bedsStatus: {},
  hkSlaLimit: 15,
  housekeepingTasks: [],
  bedAuditLogs: [],

  // 3. Patients Registry (50+ Detailed Indian Patients)
  patients: [],

  // 4. Clinical Appointments
  appointments: [],

  // 5. Inpatient Admissions Registry
  admissions: [],
  ipdAdmissionRequests: [],

  // 6. Universal Clinical Orders
  orders: [],

  // 6b. Lab & Radiology Order Queues (cross-module sync)
  labOrders: [],
  radOrders: [],

  // 7. Insurance / TPA Claims Logs
  claims: [],

  // 8. Invoicing & Billing logs
  billing: [],

  // 8b. Clinical validation rules library (Safety Rules / ruleManager)
  validationRules: [],

  // 9. Blood Bank Stock (rupees based, bag history)
  bloodStock: {
    "A+": { bags: 12, components: { rbc: 6, platelets: 4, ffp: 2 } },
    "A-": { bags: 4, components: { rbc: 2, platelets: 1, ffp: 1 } },
    "B+": { bags: 15, components: { rbc: 8, platelets: 5, ffp: 2 } },
    "B-": { bags: 3, components: { rbc: 1, platelets: 1, ffp: 1 } },
    "O+": { bags: 18, components: { rbc: 10, platelets: 6, ffp: 2 } },
    "O-": { bags: 6, components: { rbc: 3, platelets: 2, ffp: 1 } },
    "AB+": { bags: 8, components: { rbc: 4, platelets: 3, ffp: 1 } },
    "AB-": { bags: 2, components: { rbc: 1, platelets: 1, ffp: 0 } }
  },
  bloodDonors: [],

  // 10. Inventory Levels
  inventory: {
    pharmacy: generate2000Medicines(),
    _old_pharmacy: [
      {
        code: "PH-001",
        name: "Dolo 650",
        brandName: "Dolo 650",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 650mg",
        strength: "650mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Micro Labs Ltd",
        packSize: "Strip of 15",
        stock: 0,
        minStock: 500,
        price: 15,
        expiry: "2027-12-01",
        category: "Analgesics",
        locations: { "Main Pharmacy": 0, "Emergency Pharmacy": 0, "IPD Pharmacy": 0, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution. Do not exceed 2g daily in liver impairment.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-001B",
        name: "Crocin Advance",
        brandName: "Crocin Advance",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 650mg",
        strength: "650mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "GlaxoSmithKline",
        packSize: "Strip of 15",
        stock: 2400,
        minStock: 500,
        price: 18,
        expiry: "2027-10-10",
        category: "Analgesics",
        locations: { "Main Pharmacy": 1500, "Emergency Pharmacy": 500, "IPD Pharmacy": 400, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-001C",
        name: "Calpol 650",
        brandName: "Calpol 650",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 650mg",
        strength: "650mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "GSK Pharmaceuticals",
        packSize: "Strip of 15",
        stock: 1800,
        minStock: 500,
        price: 14,
        expiry: "2027-09-20",
        category: "Analgesics",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 400, "IPD Pharmacy": 400, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-001D",
        name: "Pacimol 650",
        brandName: "Pacimol 650",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 650mg",
        strength: "650mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Ipca Laboratories",
        packSize: "Strip of 15",
        stock: 40,
        minStock: 500,
        price: 12,
        expiry: "2027-11-05",
        category: "Analgesics",
        locations: { "Main Pharmacy": 40, "Emergency Pharmacy": 0, "IPD Pharmacy": 0, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-001E",
        name: "Paracetamol 650mg Generic",
        brandName: "Paracetamol 650mg Generic",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 650mg",
        strength: "650mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Jan Aushadhi",
        packSize: "Strip of 10",
        stock: 5000,
        minStock: 1000,
        price: 5,
        expiry: "2028-01-01",
        category: "Analgesics",
        locations: { "Main Pharmacy": 3500, "Emergency Pharmacy": 0, "IPD Pharmacy": 1500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-001F",
        name: "Calpol 500",
        brandName: "Calpol 500",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "GSK Pharmaceuticals",
        packSize: "Strip of 15",
        stock: 3000,
        minStock: 400,
        price: 10,
        expiry: "2027-08-01",
        category: "Analgesics",
        locations: { "Main Pharmacy": 2000, "Emergency Pharmacy": 500, "IPD Pharmacy": 500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-001G",
        name: "Crocin Pediatric Drops",
        brandName: "Crocin Pediatric Drops",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 100mg/ml",
        strength: "100mg/ml",
        dosageForm: "Drops",
        route: "Oral",
        manufacturer: "GlaxoSmithKline",
        packSize: "15ml Bottle",
        stock: 800,
        minStock: 100,
        price: 40,
        expiry: "2027-06-01",
        category: "Analgesics",
        locations: { "Main Pharmacy": 500, "Emergency Pharmacy": 200, "IPD Pharmacy": 100, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-001H",
        name: "Paracetamol IV 1000mg Injection",
        brandName: "Paracetamol IV 1000mg Injection",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 1000mg",
        strength: "1000mg",
        dosageForm: "Injection",
        route: "Intravenous",
        manufacturer: "Cipla Ltd",
        packSize: "100ml Vial",
        stock: 150,
        minStock: 20,
        price: 180,
        expiry: "2027-05-15",
        category: "Analgesics",
        locations: { "Main Pharmacy": 50, "Emergency Pharmacy": 30, "IPD Pharmacy": 50, "OT Pharmacy": 20, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-002",
        name: "Clavam 625",
        brandName: "Clavam 625",
        genericName: "Amoxicillin",
        saltComposition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
        strength: "625mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Alkem Laboratories",
        packSize: "Strip of 10",
        stock: 1200,
        minStock: 200,
        price: 120,
        expiry: "2027-08-15",
        category: "Antibiotics",
        locations: { "Main Pharmacy": 800, "Emergency Pharmacy": 200, "IPD Pharmacy": 200, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "Reduce dose in severe renal impairment (eGFR < 30). Limit to Clavam 375 or QD.",
        liverSafety: "Use with caution. Monitor LFTs in prolonged therapy.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-002B",
        name: "Novamox 500",
        brandName: "Novamox 500",
        genericName: "Amoxicillin",
        saltComposition: "Amoxicillin 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Cipla Ltd",
        packSize: "Strip of 15",
        stock: 0,
        minStock: 200,
        price: 75,
        expiry: "2027-09-01",
        category: "Antibiotics",
        locations: { "Main Pharmacy": 0, "Emergency Pharmacy": 0, "IPD Pharmacy": 0, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "Dose adjustment required in severe renal impairment (eGFR < 30).",
        liverSafety: "Safe",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-002C",
        name: "Mox 500",
        brandName: "Mox 500",
        genericName: "Amoxicillin",
        saltComposition: "Amoxicillin 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Sun Pharma",
        packSize: "Strip of 15",
        stock: 1500,
        minStock: 200,
        price: 80,
        expiry: "2027-11-15",
        category: "Antibiotics",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 200, "IPD Pharmacy": 300, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "Dose adjustment required in severe renal impairment (eGFR < 30).",
        liverSafety: "Safe",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-002D",
        name: "Amoxycillin 500mg Generic",
        brandName: "Amoxycillin 500mg Generic",
        genericName: "Amoxicillin",
        saltComposition: "Amoxicillin 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Jan Aushadhi",
        packSize: "Strip of 10",
        stock: 2000,
        minStock: 300,
        price: 30,
        expiry: "2028-03-01",
        category: "Antibiotics",
        locations: { "Main Pharmacy": 1500, "Emergency Pharmacy": 0, "IPD Pharmacy": 500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "Dose adjustment required in severe renal impairment (eGFR < 30).",
        liverSafety: "Safe",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-003",
        name: "Glycomet 500",
        brandName: "Glycomet 500",
        genericName: "Metformin",
        saltComposition: "Metformin 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "USV Private Ltd",
        packSize: "Strip of 20",
        stock: 3200,
        minStock: 400,
        price: 45,
        expiry: "2028-02-10",
        category: "Anti-Diabetics",
        locations: { "Main Pharmacy": 2000, "Emergency Pharmacy": 400, "IPD Pharmacy": 800, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Caution",
        kidneySafety: "Contraindicated if eGFR < 30. Reduce dose if eGFR 30-45.",
        liverSafety: "Avoid in hepatic impairment due to lactic acidosis risk.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-003B",
        name: "Gluformin 500",
        brandName: "Gluformin 500",
        genericName: "Metformin",
        saltComposition: "Metformin 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Abbott India",
        packSize: "Strip of 15",
        stock: 1500,
        minStock: 300,
        price: 40,
        expiry: "2028-01-15",
        category: "Anti-Diabetics",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 200, "IPD Pharmacy": 300, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Caution",
        kidneySafety: "Contraindicated if eGFR < 30. Reduce dose if eGFR 30-45.",
        liverSafety: "Avoid in hepatic impairment.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-004",
        name: "Pan-D",
        brandName: "Pan-D",
        genericName: "Pantoprazole",
        saltComposition: "Pantoprazole 40mg + Domperidone 30mg",
        strength: "40mg",
        dosageForm: "Capsule",
        route: "Oral",
        manufacturer: "Alkem Laboratories",
        packSize: "Strip of 15",
        stock: 2500,
        minStock: 300,
        price: 90,
        expiry: "2027-10-22",
        category: "Antacids",
        locations: { "Main Pharmacy": 1500, "Emergency Pharmacy": 500, "IPD Pharmacy": 500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "C",
        lactationSafety: "Caution",
        kidneySafety: "No dose adjustment required.",
        liverSafety: "Safe in short term. Monitor in severe impairment.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-004B",
        name: "Pantocid 40",
        brandName: "Pantocid 40",
        genericName: "Pantoprazole",
        saltComposition: "Pantoprazole 40mg",
        strength: "40mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Sun Pharma",
        packSize: "Strip of 15",
        stock: 2000,
        minStock: 300,
        price: 80,
        expiry: "2027-09-15",
        category: "Antacids",
        locations: { "Main Pharmacy": 1200, "Emergency Pharmacy": 400, "IPD Pharmacy": 400, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required.",
        liverSafety: "Safe",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-004C",
        name: "Pantoprazole 40mg Generic",
        brandName: "Pantoprazole 40mg Generic",
        genericName: "Pantoprazole",
        saltComposition: "Pantoprazole 40mg",
        strength: "40mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Jan Aushadhi",
        packSize: "Strip of 10",
        stock: 3500,
        minStock: 500,
        price: 25,
        expiry: "2026-07-15",
        category: "Antacids",
        locations: { "Main Pharmacy": 2500, "Emergency Pharmacy": 500, "IPD Pharmacy": 500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required.",
        liverSafety: "Safe",
        expiringSoon: true,
        coPrescribed: []
      },
      {
        code: "PH-005",
        name: "Lipvas 10",
        brandName: "Lipvas 10",
        genericName: "Atorvastatin",
        saltComposition: "Atorvastatin 10mg",
        strength: "10mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Cipla Ltd",
        packSize: "Strip of 15",
        stock: 1800,
        minStock: 250,
        price: 110,
        expiry: "2027-11-30",
        category: "Cardiovascular",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 300, "IPD Pharmacy": 500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "X",
        lactationSafety: "Contraindicated",
        kidneySafety: "No dose adjustment required.",
        liverSafety: "Contraindicated in active liver disease.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-005B",
        name: "Atorva 10",
        brandName: "Atorva 10",
        genericName: "Atorvastatin",
        saltComposition: "Atorvastatin 10mg",
        strength: "10mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Zydus Cadila",
        packSize: "Strip of 15",
        stock: 1500,
        minStock: 250,
        price: 105,
        expiry: "2027-12-15",
        category: "Cardiovascular",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 200, "IPD Pharmacy": 300, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "X",
        lactationSafety: "Contraindicated",
        kidneySafety: "No dose adjustment required.",
        liverSafety: "Contraindicated in active liver disease.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-006",
        name: "Combiflam",
        brandName: "Combiflam",
        genericName: "Ibuprofen",
        saltComposition: "Ibuprofen 400mg + Paracetamol 325mg",
        strength: "400mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Sanofi India",
        packSize: "Strip of 15",
        stock: 3800,
        minStock: 400,
        price: 20,
        expiry: "2028-01-20",
        category: "NSAID",
        locations: { "Main Pharmacy": 2500, "Emergency Pharmacy": 500, "IPD Pharmacy": 800, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "D",
        lactationSafety: "Caution",
        kidneySafety: "Avoid in severe renal impairment (eGFR < 30) due to acute kidney injury risk.",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-006B",
        name: "Ibugesic 400",
        brandName: "Ibugesic 400",
        genericName: "Ibuprofen",
        saltComposition: "Ibuprofen 400mg",
        strength: "400mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Cipla Ltd",
        packSize: "Strip of 15",
        stock: 1200,
        minStock: 200,
        price: 18,
        expiry: "2027-10-05",
        category: "NSAID",
        locations: { "Main Pharmacy": 800, "Emergency Pharmacy": 200, "IPD Pharmacy": 200, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "D",
        lactationSafety: "Caution",
        kidneySafety: "Avoid in severe renal impairment.",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-007",
        name: "Febrex Plus",
        brandName: "Febrex Plus",
        genericName: "Chlorpheniramine Maleate + Paracetamol + Phenylephrine",
        saltComposition: "Chlorpheniramine Maleate 2mg + Paracetamol 500mg + Phenylephrine 5mg",
        strength: "507mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Indoco Remedies Ltd",
        packSize: "Strip of 10",
        stock: 0,
        minStock: 250,
        price: 35,
        expiry: "2027-12-01",
        category: "Cough & Cold",
        locations: { "Main Pharmacy": 0, "Emergency Pharmacy": 0, "IPD Pharmacy": 0, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "C",
        lactationSafety: "Caution",
        kidneySafety: "Use with caution in moderate to severe renal impairment.",
        liverSafety: "Use with caution. Avoid excessive dosage as it contains paracetamol.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      }
    ],
    stores: [
      { code: "ST-001", name: "Syringes 5ml with Needle", stock: 8500, minStock: 1000, price: 5 },
      { code: "ST-002", name: "IV Infusion Sets", stock: 1500, minStock: 300, price: 45 },
      { code: "ST-003", name: "Sterile Surgical Gloves (Size 7)", stock: 2400, minStock: 500, price: 20 },
      { code: "ST-004", name: "Bedsheets (Cotton Blue)", stock: 380, minStock: 100, price: 250 },
      { code: "ST-005", name: "Patient Gowns", stock: 420, minStock: 80, price: 180 },
      { code: "ST-006", name: "Autoclave Sterilizer Indicator Tape", stock: 65, minStock: 15, price: 350 }
    ]
  },

  // 11. CSSD sterilization logs & full operational state
  cssdState: {
    instrumentSets: [
      { id: "SET-GEN-001", name: "Major Laparotomy Set", barcode: "300101", status: "Available", category: "General Surgery", itemsCount: 42, location: "Storage A-3", lastSterilization: "2026-07-01", isImplant: false },
      { id: "SET-GEN-002", name: "Major Laparotomy Set (B)", barcode: "300101B", status: "Cleaning", category: "General Surgery", itemsCount: 42, location: "Wash Area Queue", lastSterilization: "2026-06-30", isImplant: false },
      { id: "SET-ORTHO-002", name: "Large Fragment Locking Plate Set (with Implants)", barcode: "300102", status: "Issued", category: "Orthopedics", itemsCount: 65, location: "OT-02", lastSterilization: "2026-07-02", isImplant: true, implantDetails: { catalogItem: "LCP-4.5-Plate", lotNumber: "LOT-9921A", expiryDate: "2029-12-30" } },
      { id: "SET-NEURO-003", name: "Craniotomy Set", barcode: "300103", status: "Returned Dirty", category: "Neurosurgery", itemsCount: 54, location: "Dirty Receipt Queue", lastSterilization: "2026-06-28", isImplant: false },
      { id: "SET-GYNE-004", name: "Cesarean Section Set", barcode: "300104", status: "Awaiting Packing", category: "Gynecology & Obs", itemsCount: 38, location: "Packing Workstation", lastSterilization: "2026-07-02", isImplant: false },
      { id: "SET-CARD-005", name: "Open Heart Surgery Set", barcode: "300105", status: "Available", category: "Cardiology", itemsCount: 82, location: "Storage C-1", lastSterilization: "2026-07-02", isImplant: false },
      { id: "SET-OPHTH-005", name: "Micro-Surgical Set", barcode: "300106", status: "Awaiting Inspection", category: "Ophthalmology", itemsCount: 24, location: "Inspection Desk", lastSterilization: "2026-07-01", isImplant: false }
    ],
    implantCatalog: [
      { code: "IMP-SCREW-3.5", name: "Cortex Screw 3.5mm x 14mm", quantity: 150, lotNumber: "LOT-8832X", expiryDate: "2030-05-15", minStock: 20 },
      { code: "IMP-PLATE-LCP", name: "LCP Plate 4.5mm 8-Hole", quantity: 12, lotNumber: "LOT-9921A", expiryDate: "2029-12-30", minStock: 3 },
      { code: "IMP-MESH-HERNIA", name: "Proline Hernia Mesh 15x15cm", quantity: 25, lotNumber: "LOT-2231B", expiryDate: "2031-01-20", minStock: 5 },
      { code: "IMP-STENT-DES", name: "Drug Eluting Coronary Stent 3.0x18mm", quantity: 8, lotNumber: "LOT-7742C", expiryDate: "2028-09-15", minStock: 2 }
    ],
    loanerSets: [
      { id: "LNR-SPINE-001", name: "Vendor Spine Instrument Set (Medtronic)", vendor: "Medtronic India Pvt Ltd", arrivalDate: "2026-07-02", patientName: "Rajesh Kumar", caseDate: "2026-07-03", status: "Awaiting Cleaning", conditionOnReceipt: "Good", returnStatus: "Pending" },
      { id: "LNR-KNEE-002", name: "Vendor Knee Replacement Trial Set (Zimmer Biomet)", vendor: "Zimmer India", arrivalDate: "2026-07-01", patientName: "Mohammed Iqbal", caseDate: "2026-07-02", status: "Returned to Vendor", conditionOnReceipt: "Good", returnStatus: "Returned (Clean)", disputeRemarks: "" }
    ],
    queues: {
      dirtyReceipt: [
        { id: "RET-101", setName: "Craniotomy Set", setCode: "SET-NEURO-003", returnDept: "OT-03", returnedBy: "Nurse Mary", receivedBy: "Technician Ashok", returnTime: "2026-07-02 14:30", status: "Awaiting Cleaning", missingItems: [], damagedItems: [], contaminationLevel: "High" }
      ],
      cleaning: [
        { id: "CLN-101", setName: "Major Laparotomy Set (B)", setCode: "SET-GEN-002", method: "Ultrasonic Cleaning", status: "Cleaning", startTime: "2026-07-02 18:30", technician: "Technician Ashok" }
      ],
      inspection: [
        { id: "INSP-101", setName: "Micro-Surgical Set", setCode: "SET-OPHTH-005", status: "Awaiting Assembly", checklistStatus: "Checked", technician: "Technician Ashok", result: "Pass", condemnationRequired: false }
      ],
      packing: [
        { id: "PCK-101", setName: "Cesarean Section Set (B)", setCode: "SET-GYNE-004", status: "Ready for Packing", packagingMaterial: "Double Wrap Non-Woven SMS", packedBy: "Technician Ashok" }
      ],
      sterilization: [
        { id: "STER-101", sterilizer: "ST-STEAM-01", cycleNo: "CYC-9844", loadNo: "LOAD-4820", temperature: "134°C", pressure: "2.1 bar", exposureTime: "4 minutes", status: "Sterilization Completed", technician: "Technician Ashok", startTime: "2026-07-02 18:00", endTime: "2026-07-02 18:45", isImplant: true, biStartedAt: "2026-07-02 18:45", biStatus: "Pending", biResult: null, items: ["SET-ORTHO-002"], emergencyOverride: null }
      ]
    },
    sterilizers: [
      { code: "ST-STEAM-01", name: "Steam Autoclave 450L (Horizontal)", type: "Steam Autoclave", status: "Active", lastValidation: "2026-06-15", pmDueDate: "2026-09-15" },
      { code: "ST-ETO-01", name: "ETO Sterilizer 120L", type: "Ethylene Oxide (ETO)", status: "Active", lastValidation: "2026-05-10", pmDueDate: "2026-11-10" }
    ],
    waterQualityLogs: [
      { date: "2026-07-02", time: "08:00 AM", feedWaterTds: "45 ppm", roWaterTds: "3 ppm", ph: "6.8", hardness: "Nil", loggedBy: "Biomedical Engineer Vivek" }
    ],
    implantIssues: [
      { id: "ISS-IMP-01", patientUhid: "SH-2026-04821", patientName: "Rajesh Kumar", surgeon: "Dr. Srinivasan", procedure: "Spine Fixation L4-L5", implantCode: "IMP-PLATE-LCP", implantName: "LCP Plate 4.5mm 8-Hole", lotNumber: "LOT-9921A", expiryDate: "2029-12-30", issuedDate: "2026-07-02" }
    ],
    auditLogs: []
  },
  cssdLogs: [],

  // 12. Equipment List
  equipment: [
    { code: "EQ-101", name: "Syringe Pump Universal (B. Braun)", location: "ICCU", status: "Active", amcExpiry: "2027-03-15", lastCalib: "2026-05-10" },
    { code: "EQ-102", name: "Defibrillator Cardiopak", location: "Emergency", status: "Active", amcExpiry: "2026-11-20", lastCalib: "2026-04-12" },
    { code: "EQ-103", name: "Anesthesia Workstation (Dräger)", location: "OT-01", status: "Active", amcExpiry: "2027-01-18", lastCalib: "2026-05-02" },
    { code: "EQ-104", name: "Patient Monitor Goldway G30", location: "Ward 1", status: "Under Repair", amcExpiry: "2026-09-05", lastCalib: "2025-10-14" },
    { code: "EQ-105", name: "ECG Machine 12 Channel", location: "OPD", status: "Active", amcExpiry: "2027-04-20", lastCalib: "2026-03-28" }
  ],
  maintenanceComplaints: [],

  // 13. Laundry batches
  laundryBatches: [],

  // 14. Audit logs for clinical/medication override events
  auditLogs: []
};

// --------------------------------------------------------------------------
// GLOBAL DATE HELPERS — anchored to the demo window (1 Jan – 5 Jul 2026).
// "Today" is pinned to 5 Jul 2026 (the last day of the window) so that every
// relative offset the seeds compute stays inside the mandated range and no
// record drifts into the future as real-world time advances.
// --------------------------------------------------------------------------
window._HIS_ANCHOR = new Date().toISOString().slice(0, 10);
function _hisBase() { return new Date(window._HIS_ANCHOR + 'T00:00:00'); }

window._HIS_TODAY = window._HIS_ANCHOR; // YYYY-MM-DD

// Monkeypatch toLocaleDateString for DD MM YYYY formatting globally
const originalToLocaleDateString = Date.prototype.toLocaleDateString;
Date.prototype.toLocaleDateString = function(locales, options) {
  if (locales === 'en-CA') {
    return originalToLocaleDateString.call(this, locales, options);
  }
  const dd = String(this.getDate()).padStart(2, '0');
  const mm = String(this.getMonth() + 1).padStart(2, '0');
  const yyyy = this.getFullYear();
  return `${dd} ${mm} ${yyyy}`;
};

// Global formatting helper
window.formatDateToDDMMYYYY = function(dateStr) {
  if (!dateStr) return '';
  if (/^\d{2} \d{2} \d{4}$/.test(dateStr)) return dateStr;
  
  const cleanStr = dateStr.split('T')[0];
  const parts = cleanStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2]} ${parts[1]} ${parts[0]}`;
    } else if (parts[2].length === 4) {
      return `${parts[0]} ${parts[1]} ${parts[2]}`;
    }
  }
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd} ${mm} ${yyyy}`;
};

window._HIS_TODAY_PRETTY = (function() {
  return _hisBase().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
})();

window._HIS_DATE = function(daysAgo) {
  const d = _hisBase();
  d.setDate(d.getDate() - (daysAgo || 0));
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

window._HIS_PRETTY = function(daysAgo, timeStr) {
  const d = _hisBase();
  d.setDate(d.getDate() - (daysAgo || 0));
  const pretty = d.toLocaleDateString();
  return timeStr ? `${pretty} · ${timeStr}` : pretty;
};

// --------------------------------------------------------------------------
// STATE SEED ENGINE (Generates 50+ Patients & Logs)
// --------------------------------------------------------------------------
function seedState() {
  const storedPatients = localStorage.getItem('saronil_patients');
  
  // Self-healing migration for new ward configuration
  if (storedPatients && storedPatients.includes('GW(M)-409')) {
    localStorage.removeItem('saronil_patients');
    localStorage.removeItem('saronil_bedsStatus');
    localStorage.removeItem('saronil_admissions');
    localStorage.removeItem('saronil_daycare_admissions');
    localStorage.removeItem('saronil_bedAuditLogs');
    localStorage.removeItem('saronil_billing');
    window.location.reload();
    return;
  }

  const storedDoctors = localStorage.getItem('saronil_doctors');
  const storedNurses = localStorage.getItem('saronil_nurses');
  const storedStaff = localStorage.getItem('saronil_staff');
  
  // Self-healing migration for new staff dataset (100 various staff members added)
  if (storedDoctors && JSON.parse(storedDoctors).length < 30) {
    localStorage.removeItem('saronil_doctors');
    localStorage.removeItem('saronil_nurses');
    localStorage.removeItem('saronil_staff');
    localStorage.removeItem('saronil_staffList');
    window.location.reload();
    return;
  }
  
  if (storedPatients && storedDoctors && storedNurses && storedStaff) {
    state.patients = JSON.parse(storedPatients);
    state.doctors = JSON.parse(storedDoctors);
    state.nurses = JSON.parse(storedNurses);
    state.staff = JSON.parse(storedStaff);
    
    // Align patients data for active consultant and today's date
    let updatedPatients = false;
    state.patients.forEach(p => {
      if (p.type === 'OPD' && (p.uhid === 'SH-2026-04862' || p.uhid === 'SH-2026-04864' || p.uhid === 'SH-2026-04868')) {
        if (p.primaryConsultant !== 'Dr. Amit Verma') {
          p.primaryConsultant = 'Dr. Amit Verma';
          updatedPatients = true;
        }
        const timePart = p.admitted && p.admitted.includes(' · ') ? p.admitted.split(' · ')[1] : '09:15';
        const todayPretty = window._HIS_TODAY_PRETTY || new Date().toLocaleDateString();
        const expectedAdmitted = `${todayPretty} · ${timePart}`;
        if (p.admitted !== expectedAdmitted) {
          p.admitted = expectedAdmitted;
          updatedPatients = true;
        }
      }
    });
    if (updatedPatients) {
      localStorage.setItem('saronil_patients', JSON.stringify(state.patients));
    }
    
    state.appointments = JSON.parse(localStorage.getItem('saronil_appointments')) || [];
    state.admissions = JSON.parse(localStorage.getItem('saronil_admissions')) || [];
    state.billing = JSON.parse(localStorage.getItem('saronil_billing')) || [];
    state.orders = JSON.parse(localStorage.getItem('saronil_orders')) || [];
    state.labOrders = JSON.parse(localStorage.getItem('saronil_labOrders')) || [];
    state.radOrders = JSON.parse(localStorage.getItem('saronil_radOrders')) || [];
    state.bedsStatus = JSON.parse(localStorage.getItem('saronil_bedsStatus')) || {};
    state.bedAuditLogs = JSON.parse(localStorage.getItem('saronil_bedAuditLogs')) || [];
    if (state.bedAuditLogs.length === 0) {
      state.bedAuditLogs = [
        {
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          patientId: "SH-2026-04821",
          encounterId: "ENC-10041",
          bedId: "GW(M)-410",
          wardKey: "GENERAL-WARD-M",
          prevStatus: "Available",
          newStatus: "Occupied",
          action: "Allocation",
          user: "ATD Coordinator",
          role: "ATD Executive",
          reason: "New Admission Intake",
          remarks: "Admitted Rajesh Kumar to general bed GW(M)-410"
        },
        {
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          patientId: "SH-2026-04850",
          encounterId: "ENC-10022",
          bedId: "GW(M)-409",
          wardKey: "GENERAL-WARD-M",
          prevStatus: "Occupied",
          newStatus: "Dirty",
          action: "Release",
          user: "ATD Coordinator",
          role: "ATD Executive",
          reason: "Discharge checkout",
          remarks: "Bed GW(M)-409 released post-discharge of Rajan Pillai"
        },
        {
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          patientId: null,
          encounterId: null,
          bedId: "PVT-201",
          wardKey: "PRIVATE",
          prevStatus: "Dirty",
          newStatus: "Cleaning",
          action: "Status Correction",
          user: "Nursing Supervisor",
          role: "Nurse Lead",
          reason: "Housekeeping trigger",
          remarks: "Began daily isolation clean protocol"
        },
        {
          timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
          patientId: null,
          encounterId: null,
          bedId: "DELUXE-401",
          wardKey: "DELUXE",
          prevStatus: "Available",
          newStatus: "Blocked",
          action: "Status Correction",
          user: "Administrator",
          role: "MS Admin",
          reason: "AC maintenance repair",
          remarks: "Bed DELUXE-401 blocked for AC servicing"
        }
      ];
      localStorage.setItem('saronil_bedAuditLogs', JSON.stringify(state.bedAuditLogs));
    }
    state.bedActivityLogs = JSON.parse(localStorage.getItem('saronil_bedActivityLogs')) || [];
    if (state.bedActivityLogs.length === 0) {
      seedBedActivityLogs();
    }
    state.daycareAdmissions = JSON.parse(localStorage.getItem('saronil_daycare_admissions')) || [];
    
    state.reportCatalog = JSON.parse(localStorage.getItem('saronil_report_catalog'));
    state.reportAuditLogs = JSON.parse(localStorage.getItem('saronil_report_audit_logs'));
    state.fieldExposures = JSON.parse(localStorage.getItem('saronil_field_exposures'));
    state.reportSchedules = JSON.parse(localStorage.getItem('saronil_report_schedules'));
    state.customReportTemplates = JSON.parse(localStorage.getItem('saronil_custom_templates'));
    state.reportArchive = JSON.parse(localStorage.getItem('saronil_report_archive'));
    
    if (!state.reportCatalog || !state.reportAuditLogs || !state.fieldExposures || !state.reportSchedules || !state.customReportTemplates || !state.reportArchive) {
      seedReports();
    }

    state.outstandingBills = JSON.parse(localStorage.getItem('saronil_outstandingBills')) || [];
    state.followUpLogs = JSON.parse(localStorage.getItem('saronil_followUpLogs')) || [];
    state.writeOffRecords = JSON.parse(localStorage.getItem('saronil_writeOffRecords')) || [];
    state.suspenseReceipts = JSON.parse(localStorage.getItem('saronil_suspenseReceipts')) || [];
    state.matchAttemptLogs = JSON.parse(localStorage.getItem('saronil_matchAttemptLogs')) || [];
    state.bulkAllocations = JSON.parse(localStorage.getItem('saronil_bulkAllocations')) || [];
    state.gstRateConfigs = JSON.parse(localStorage.getItem('saronil_gstRateConfigs')) || [];
    state.gstInvoiceSeries = JSON.parse(localStorage.getItem('saronil_gstInvoiceSeries')) || [];
    state.gstinMaster = JSON.parse(localStorage.getItem('saronil_gstinMaster')) || [];
    state.nonBillingRevenue = JSON.parse(localStorage.getItem('saronil_nonBillingRevenue')) || [];
    state.vendorInvoices = JSON.parse(localStorage.getItem('saronil_vendorInvoices')) || [];
    state.gstNotices = JSON.parse(localStorage.getItem('saronil_gstNotices')) || [];
    state.returnFilings = JSON.parse(localStorage.getItem('saronil_returnFilings')) || [];
    state.complianceCalendar = JSON.parse(localStorage.getItem('saronil_complianceCalendar')) || [];
    state.pantryInventory = JSON.parse(localStorage.getItem('saronil_pantryInventory')) || [];
    state.pantryProcurement = JSON.parse(localStorage.getItem('saronil_pantryProcurement')) || null;
    state.cafeteriaBills = JSON.parse(localStorage.getItem('saronil_cafeteriaBills')) || [];
    state.foodSafetyLogs = JSON.parse(localStorage.getItem('saronil_foodSafetyLogs')) || null;
    state.consumptionRecords = JSON.parse(localStorage.getItem('saronil_consumptionRecords')) || [];
    state.pantryLocations = JSON.parse(localStorage.getItem('saronil_pantryLocations')) || [];
    state.inventoryMovementLog = JSON.parse(localStorage.getItem('saronil_inventoryMovementLog')) || [];
    state.pantryWIPBatches = JSON.parse(localStorage.getItem('saronil_pantryWIPBatches')) || [];
    state.kitchenFloorStock = JSON.parse(localStorage.getItem('saronil_kitchenFloorStock')) || [];
    state.kitchenEquipmentAssets = JSON.parse(localStorage.getItem('saronil_kitchenEquipmentAssets')) || [];
    state.kitchenConsumableStock = JSON.parse(localStorage.getItem('saronil_kitchenConsumableStock')) || [];
    state.wardPantryStock = JSON.parse(localStorage.getItem('saronil_wardPantryStock')) || [];
    state.mealDeliveryLog = JSON.parse(localStorage.getItem('saronil_mealDeliveryLog')) || [];
    state.pantryDishes = JSON.parse(localStorage.getItem('saronil_pantryDishes')) || [];
    
    console.log(`Synchronized database loaded from localStorage: ${state.patients.length} patients, ${state.doctors.length} doctors, ${state.nurses.length} nurses, ${state.staff.length} staff.`);
    return;
  }

  // Initialize all beds as available
  for (const [wardKey, wardInfo] of Object.entries(state.wards)) {
    for (const bed of wardInfo.beds) {
      state.bedsStatus[bed] = {
        wardKey: wardKey,
        status: "Available",
        patientUhid: null,
        notes: ""
      };
    }
  }

  // Define exactly 25 static dummy patients with EMR keys
  const staticPatients = [
    // ────────────────────────────────────────────────────────────────────────
    // 10 IPD PATIENTS
    // ────────────────────────────────────────────────────────────────────────
    {
      uhid: "SH-2026-04821", name: "Rajesh Kumar", age: 45, gender: "Male",
      type: "IPD", ward: "General Ward", bed: "B-12", los: 3,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Star Health", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: ["Critical"], newsScore: 6, status: "Admitted", lastActivity: "Vitals · 10:15 AM",
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [{ name: "Tab Pantocid 40mg", dose: "1 tab", freq: "Once daily", duration: "10 Days", generic: "Pantoprazole", route: "Oral", active: true }],
      clinicalData: { complaint: "General chest discomfort", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Monitoring", carePlan: "Routine check" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "Penicillin", mobile: "9876543210", flags: [], admitted: window._HIS_PRETTY(3, '10:15'), ipNumber: "IP-240001", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04803", name: "Priya Menon", age: 38, gender: "Female",
      type: "IPD", ward: "Private", bed: "P-04", los: 4,
      primaryConsultant: "Dr. Krishnamurthy", department: "Psychiatry",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Progress note · 9:30 AM",
      vitals: { bp: "110/70", hr: 68, temp: 98.6, spo2: 99, weight: 58, bmi: 21.3, pain: 0, rr: 14 },
      prescriptions: [{ name: "Tab Olimelt 5mg", dose: "1 tab", freq: "Bedtime", duration: "30 Days", generic: "Olanzapine", route: "Oral", active: true }],
      clinicalData: { complaint: "Anxiety", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Therapy", carePlan: "Routine check" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9823456789", flags: [], admitted: window._HIS_PRETTY(4, '09:30'), ipNumber: "IP-240002", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04799", name: "Mohammed Iqbal", age: 62, gender: "Male",
      type: "IPD", ward: "HDU", bed: "H-02", los: 5,
      primaryConsultant: "Dr. Mehta", department: "General Surgery",
      payer: "HDFC ERGO", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: ["Critical"], newsScore: 4, status: "Post-Op", lastActivity: "Vitals · 8:45 AM",
      vitals: { bp: "130/85", hr: 80, temp: 99.0, spo2: 96, weight: 75, bmi: 24.5, pain: 3, rr: 18 },
      prescriptions: [{ name: "Inj Tramadol 50mg", dose: "1 amp", freq: "SOS", duration: "3 Days", generic: "Tramadol", route: "IV", active: true }],
      clinicalData: { complaint: "Post operative recovery", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Analgesics", carePlan: "Routine check" },
      history: { pastConditions: "None", surgeries: "Appendectomy", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9912345678", flags: ["Critical"], admitted: window._HIS_PRETTY(5, '08:45'), ipNumber: "IP-240003", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04788", name: "Arun Pillai", age: 55, gender: "Male",
      type: "IPD", ward: "HDU", bed: "H-03", los: 3,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "New India Assurance", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 1, status: "Admitted", lastActivity: "Ward rounds · 8:15 AM",
      vitals: { bp: "128/80", hr: 78, temp: 98.6, spo2: 98, weight: 78, bmi: 25.1, pain: 2, rr: 16 },
      prescriptions: [{ name: "Tab Cardace 5mg", dose: "1 tab", freq: "Morning", duration: "Continuous", generic: "Ramipril", route: "Oral", active: true }],
      clinicalData: { complaint: "Hypertension evaluation", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Vitals monitoring", carePlan: "Stepdown check" },
      history: { pastConditions: "Hypertension", surgeries: "None", familyHistory: "Hypertension" },
      bloodGroup: "A+", allergies: "None", mobile: "9845011006", flags: [], admitted: window._HIS_PRETTY(3, '08:15'), ipNumber: "IP-240005", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04810", name: "Fatima Begum", age: 50, gender: "Female",
      type: "IPD", ward: "General Ward", bed: "B-15", los: 4,
      primaryConsultant: "Dr. Ramesh Iyer", department: "Pediatrics",
      payer: "Star Health", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Vitals · 9:15 AM",
      vitals: { bp: "135/85", hr: 72, temp: 98.4, spo2: 98, weight: 65, bmi: 24.3, pain: 0, rr: 16 },
      prescriptions: [{ name: "Tab Glycomet 500mg", dose: "1 tab", freq: "Twice daily", duration: "Continuous", generic: "Metformin", route: "Oral", active: true }],
      clinicalData: { complaint: "Hyperglycemia control", hpi: "None", examination: "NAD", diagnosis: "Type 2 Diabetes", treatmentPlan: "Diet and medication tuning", carePlan: "Routine monitoring" },
      history: { pastConditions: "Diabetes", surgeries: "None", familyHistory: "Diabetes" },
      bloodGroup: "AB+", allergies: "Sulfa drugs", mobile: "9845011009", flags: [], admitted: window._HIS_PRETTY(4, '09:15'), ipNumber: "IP-240008", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04790", name: "Vikram Singh", age: 68, gender: "Male",
      type: "IPD", ward: "ICU", bed: "ICU-05", los: 5,
      primaryConsultant: "Dr. Mehta", department: "General Surgery",
      payer: "United India", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: ["Critical"], newsScore: 5, status: "Post-Op", lastActivity: "Cardiac rehab · 7:30 AM",
      vitals: { bp: "115/70", hr: 84, temp: 98.6, spo2: 96, weight: 72, bmi: 23.7, pain: 3, rr: 18 },
      prescriptions: [{ name: "Tab Lasix 40mg", dose: "1 tab", freq: "Morning", duration: "10 Days", generic: "Furosemide", route: "Oral", active: true }],
      clinicalData: { complaint: "Post CABG chest pain", hpi: "None", examination: "Surgical wound healing", diagnosis: "CAD Post-CABG", treatmentPlan: "Anti-anginals and fluid restriction", carePlan: "Stepdown monitoring" },
      history: { pastConditions: "CAD, HTN", surgeries: "CABG", familyHistory: "Heart disease" },
      bloodGroup: "O+", allergies: "None", mobile: "9845011010", flags: ["Critical"], admitted: window._HIS_PRETTY(5, '07:30'), ipNumber: "IP-240009", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04831", name: "Anitha Rao", age: 47, gender: "Female",
      type: "IPD", ward: "Semi-Private", bed: "SP-02", los: 2,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "Star Health", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Dressing · 10:00 AM",
      vitals: { bp: "120/80", hr: 74, temp: 98.4, spo2: 99, weight: 60, bmi: 23.4, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Pelvic pain and evaluation", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Symptomatic treatment", carePlan: "Routine monitoring" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9845011011", flags: [], admitted: window._HIS_PRETTY(2, '10:00'), ipNumber: "IP-240010", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04768", name: "Suresh Babu", age: 52, gender: "Male",
      type: "IPD", ward: "Semi-Private", bed: "SP-05", los: 3,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "CGHS", payerType: "Govt Scheme", preAuthStatus: "Approved",
      alerts: [], newsScore: 2, status: "Admitted", lastActivity: "Ward rounds · 8:30 AM",
      vitals: { bp: "138/88", hr: 82, temp: 98.8, spo2: 97, weight: 82, bmi: 26.1, pain: 2, rr: 18 },
      prescriptions: [{ name: "Tab Amlong 5mg", dose: "1 tab", freq: "Once daily", duration: "Continuous", generic: "Amlodipine", route: "Oral", active: true }],
      clinicalData: { complaint: "Uncontrolled blood pressure", hpi: "None", examination: "NAD", diagnosis: "Essential Hypertension", treatmentPlan: "Adjust antihypertensives", carePlan: "Vitals log" },
      history: { pastConditions: "HTN", surgeries: "None", familyHistory: "Hypertension" },
      bloodGroup: "B+", allergies: "None", mobile: "9845011012", flags: [], admitted: window._HIS_PRETTY(3, '08:30'), ipNumber: "IP-240011", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04798", name: "Arjun Nair", age: 49, gender: "Male",
      type: "IPD", ward: "ICU", bed: "ICU-07", los: 5,
      primaryConsultant: "Dr. Anand", department: "Cardiology",
      payer: "Corporate", payerType: "Corporate", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 1, status: "Post-Op", lastActivity: "Ward rounds · 7:50 AM",
      vitals: { bp: "128/80", hr: 80, temp: 98.4, spo2: 98, weight: 80, bmi: 24.9, pain: 2, rr: 18 },
      prescriptions: [{ name: "Tab Storvas 20mg", dose: "1 tab", freq: "Night", duration: "Continuous", generic: "Atorvastatin", route: "Oral", active: true }],
      clinicalData: { complaint: "Post CABG recovery", hpi: "None", examination: "Chest dressing clean", diagnosis: "Post-CABG", treatmentPlan: "Cardiac rehab", carePlan: "Stepdown monitor" },
      history: { pastConditions: "CAD", surgeries: "CABG", familyHistory: "Heart disease" },
      bloodGroup: "O+", allergies: "None", mobile: "9988771122", flags: [], admitted: window._HIS_PRETTY(5, '07:50'), ipNumber: "IP-240015", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04850", name: "Rajan Pillai", age: 50, gender: "Male",
      type: "IPD", ward: "General Ward", bed: "B-13", los: 2,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Ward rounds · 11:00 AM",
      vitals: { bp: "122/82", hr: 75, temp: 98.5, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Fever and weakness", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "IV fluids", carePlan: "Monitor temperature" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9845011030", flags: [], admitted: window._HIS_PRETTY(2, '11:00'), ipNumber: "IP-240020", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },

    // ────────────────────────────────────────────────────────────────────────
    // 10 OPD PATIENTS
    // ────────────────────────────────────────────────────────────────────────
    {
      uhid: "SH-2026-04817", name: "Sunita Sharma", age: 29, gender: "Female",
      type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "In Consultation", lastActivity: "Registered · 11:15 AM",
      vitals: { bp: "115/75", hr: 76, temp: 98.2, spo2: 99, weight: 52, bmi: 20.3, pain: 1, rr: 14 },
      prescriptions: [],
      clinicalData: { complaint: "Mild lower back discomfort", hpi: "Backache since 2 days", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Rest and warm packs", carePlan: "Follow up as needed" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "None", mobile: "9845011005", flags: [], admitted: window._HIS_PRETTY(0, '11:15'), ipNumber: "—", opNumber: "OP-240004", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04826", name: "Meera Iyer", age: 8, gender: "Female",
      type: "OPD", ward: "Paediatrics Room 1", bed: "—", los: 1,
      primaryConsultant: "Dr. Ramesh Iyer", department: "Pediatrics",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Scheduled", lastActivity: "Registration · 13:30 PM",
      vitals: { bp: "100/60", hr: 95, temp: 99.1, spo2: 99, weight: 24, bmi: 15.6, pain: 1, rr: 20 },
      prescriptions: [],
      clinicalData: { complaint: "Mild cough and running nose", hpi: "Cold since 3 days", examination: "Chest clear", diagnosis: "Acute Rhinopharyngitis", treatmentPlan: "Saline nasal drops, hydration", carePlan: "Follow up if fever develops" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9845011013", flags: [], admitted: window._HIS_PRETTY(0, '13:30'), ipNumber: "—", opNumber: "OP-240012", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04861", name: "Amit Sharma", age: 34, gender: "Male",
      type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Scheduled", lastActivity: "Registration · 09:00 AM",
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 99, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Routine health checkup", hpi: "None", examination: "NAD", diagnosis: "Routine Check", treatmentPlan: "None", carePlan: "Annual follow-up" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9845011031", flags: [], admitted: window._HIS_PRETTY(0, '09:00'), ipNumber: "—", opNumber: "OP-240061", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04862", name: "Rohan Verma", age: 28, gender: "Male",
      type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
      primaryConsultant: "Dr. Amit Verma", department: "General Medicine",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Checked In", lastActivity: "Registered · 09:15 AM",
      vitals: { bp: "118/75", hr: 70, temp: 98.2, spo2: 99, weight: 68, bmi: 22.0, pain: 0, rr: 14 },
      prescriptions: [],
      clinicalData: { complaint: "Mild headache and body pain", hpi: "Headache since 1 day", examination: "NAD", diagnosis: "Tension Headache", treatmentPlan: "Analgesics", carePlan: "Follow up SOS" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "None", mobile: "9845011032", flags: [], admitted: window._HIS_PRETTY(0, '09:15'), ipNumber: "—", opNumber: "OP-240062", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04863", name: "Sanjay Joshi", age: 42, gender: "Male",
      type: "OPD", ward: "OPD Room 3", bed: "—", los: 1,
      primaryConsultant: "Dr. Mehta", department: "General Surgery",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Scheduled", lastActivity: "Registration · 09:30 AM",
      vitals: { bp: "125/82", hr: 75, temp: 98.4, spo2: 98, weight: 75, bmi: 24.5, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Post-op follow-up check", hpi: "None", examination: "Surgical wound healing well", diagnosis: "Post-Op Stable", treatmentPlan: "Suture line cleaning", carePlan: "Normal activities" },
      history: { pastConditions: "Hernia", surgeries: "Hernioplasty", familyHistory: "None" },
      bloodGroup: "A-", allergies: "None", mobile: "9845011033", flags: [], admitted: window._HIS_PRETTY(0, '09:30'), ipNumber: "—", opNumber: "OP-240063", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04864", name: "Kiran Patel", age: 31, gender: "Female",
      type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
      primaryConsultant: "Dr. Amit Verma", department: "Gynecology & Obs",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Checked In", lastActivity: "Registered · 09:45 AM",
      vitals: { bp: "110/70", hr: 74, temp: 98.6, spo2: 99, weight: 55, bmi: 21.0, pain: 0, rr: 14 },
      prescriptions: [],
      clinicalData: { complaint: "Antenatal checkup", hpi: "First trimester", examination: "NAD", diagnosis: "Early Pregnancy", treatmentPlan: "Iron, Folic Acid supplements", carePlan: "Monthly checkup" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "AB+", allergies: "None", mobile: "9845011034", flags: [], admitted: window._HIS_PRETTY(0, '09:45'), ipNumber: "—", opNumber: "OP-240064", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04865", name: "Divya Reddy", age: 36, gender: "Female",
      type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Scheduled", lastActivity: "Registration · 10:00 AM",
      vitals: { bp: "115/78", hr: 76, temp: 98.4, spo2: 99, weight: 60, bmi: 23.4, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Routine follow-up", hpi: "None", examination: "NAD", diagnosis: "Stable", treatmentPlan: "Continue meds", carePlan: "Follow up 3 months" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O-", allergies: "None", mobile: "9845011035", flags: [], admitted: window._HIS_PRETTY(0, '10:00'), ipNumber: "—", opNumber: "OP-240065", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04866", name: "Neha Sen", age: 25, gender: "Female",
      type: "OPD", ward: "OPD Room 4", bed: "—", los: 1,
      primaryConsultant: "Dr. Ramesh Iyer", department: "Pediatrics",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "In Consultation", lastActivity: "Registered · 10:15 AM",
      vitals: { bp: "108/68", hr: 78, temp: 98.6, spo2: 99, weight: 50, bmi: 19.5, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Acne and skin evaluation", hpi: "Mild acne breakout", examination: "NAD", diagnosis: "Acne Vulgaris", treatmentPlan: "Topical gels, face wash", carePlan: "Avoid oily food" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9845011036", flags: [], admitted: window._HIS_PRETTY(0, '10:15'), ipNumber: "—", opNumber: "OP-240066", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04867", name: "Vijay Das", age: 58, gender: "Male",
      type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Scheduled", lastActivity: "Registration · 10:30 AM",
      vitals: { bp: "140/90", hr: 80, temp: 98.4, spo2: 98, weight: 82, bmi: 26.1, pain: 0, rr: 18 },
      prescriptions: [],
      clinicalData: { complaint: "High BP checking", hpi: "None", examination: "NAD", diagnosis: "Hypertension Stage 1", treatmentPlan: "Amlodipine 5mg daily", carePlan: "Daily BP chart" },
      history: { pastConditions: "HTN", surgeries: "None", familyHistory: "Hypertension" },
      bloodGroup: "B-", allergies: "None", mobile: "9845011037", flags: [], admitted: window._HIS_PRETTY(0, '10:30'), ipNumber: "—", opNumber: "OP-240067", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04868", name: "Asha Rao", age: 50, gender: "Female",
      type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
      primaryConsultant: "Dr. Amit Verma", department: "General Medicine",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Checked In", lastActivity: "Registered · 10:45 AM",
      vitals: { bp: "130/85", hr: 75, temp: 98.4, spo2: 98, weight: 65, bmi: 24.3, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Joint pain check", hpi: "Knee pain since 1 month", examination: "NAD", diagnosis: "Mild Osteoarthritis", treatmentPlan: "Calcium, Vitamin D, Physio", carePlan: "Avoid climbing stairs" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "Osteoarthritis" },
      bloodGroup: "AB-", allergies: "None", mobile: "9845011038", flags: [], admitted: window._HIS_PRETTY(0, '10:45'), ipNumber: "—", opNumber: "OP-240068", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },

    // ────────────────────────────────────────────────────────────────────────
    // 3 DAYCARE PATIENTS
    // ────────────────────────────────────────────────────────────────────────
    {
      uhid: "SH-2026-04822", name: "Kavitha Nair", age: 34, gender: "Female",
      type: "Daycare", ward: "Daycare Bay", bed: "D-11", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "HDFC ERGO", payerType: "TPA/Insurance", preAuthStatus: "Approved",
      alerts: [], newsScore: 0, status: "Under Observation", lastActivity: "Dressing · 2:00 PM",
      vitals: { bp: "120/80", hr: 74, temp: 98.4, spo2: 99, weight: 62, bmi: 23.9, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Diagnostic hysteroscopy post-op", hpi: "None", examination: "NAD", diagnosis: "Post-op stable", treatmentPlan: "Discharge clearance check", carePlan: "Home advice" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9845011007", flags: [], admitted: window._HIS_PRETTY(0, '14:00'), ipNumber: "—", opNumber: "OP-240006", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04812", name: "Rahul Gupta", age: 26, gender: "Male",
      type: "Daycare", ward: "Daycare Bay", bed: "D-14", los: 1,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Under Observation", lastActivity: "Dressing · 11:30 AM",
      vitals: { bp: "118/76", hr: 72, temp: 98.4, spo2: 99, weight: 65, bmi: 21.8, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Laceration dressing post-suture", hpi: "None", examination: "NAD", diagnosis: "Sutured wound stable", treatmentPlan: "Suture line cleaning", carePlan: "Discharge in afternoon" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9845011014", flags: [], admitted: window._HIS_PRETTY(0, '11:30'), ipNumber: "—", opNumber: "OP-240013", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04801", name: "Lakshmi Devi", age: 60, gender: "Female",
      type: "Daycare", ward: "Daycare Bay", bed: "D-09", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "HDFC ERGO", payerType: "TPA/Insurance", preAuthStatus: "Approved",
      alerts: [], newsScore: 0, status: "Discharged", lastActivity: "Discharged · 2:30 PM",
      vitals: { bp: "130/80", hr: 74, temp: 98.4, spo2: 99, weight: 60, bmi: 23.4, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Daycare hysteroscopy recovery", hpi: "None", examination: "Sutures stable", diagnosis: "Post-procedure", treatmentPlan: "Rest", carePlan: "Discharge check" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "None", mobile: "9876512345", flags: [], admitted: window._HIS_PRETTY(0, '14:30'), ipNumber: "—", opNumber: "OP-240014", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: true, billing: true, summaryReady: true }
    },

    // ────────────────────────────────────────────────────────────────────────
    // 2 EMERGENCY PATIENTS
    // ────────────────────────────────────────────────────────────────────────
    {
      uhid: "SH-2026-04755", name: "Deepak Verma", age: 41, gender: "Male",
      type: "Emergency", ward: "Emergency Bay", bed: "Resus-1", los: 1,
      primaryConsultant: "Dr. Fatima Sheikh", department: "Emergency Medicine",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: ["Critical"], newsScore: 7, status: "In Triage", lastActivity: "Resuscitation · 10:45 AM",
      vitals: { bp: "95/60", hr: 112, temp: 100.2, spo2: 91, weight: 68, bmi: 22.2, pain: 4, rr: 24 },
      prescriptions: [],
      clinicalData: { complaint: "High fever and respiratory distress", hpi: "Worsening symptoms since yesterday", examination: "Bilateral crepitations", diagnosis: "Severe Pneumonia", treatmentPlan: "Oxygen support, IV Antibiotics", carePlan: "Transfer to ICU" },
      history: { pastConditions: "Asthma", surgeries: "None", familyHistory: "Asthma" },
      bloodGroup: "B-", allergies: "None", mobile: "9845011008", flags: ["Critical"], admitted: window._HIS_PRETTY(0, '10:45'), ipNumber: "—", opNumber: "OP-240007", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04870", name: "Pramod Rao", age: 45, gender: "Male",
      type: "Emergency", ward: "Emergency Bay", bed: "EMG-02", los: 1,
      primaryConsultant: "Dr. Fatima Sheikh", department: "Emergency Medicine",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 3, status: "In Triage", lastActivity: "Registration · 11:30 AM",
      vitals: { bp: "115/75", hr: 80, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Mild chest pain", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "ECG, monitoring", carePlan: "Observation" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9845011039", flags: [], admitted: window._HIS_PRETTY(0, '11:30'), ipNumber: "—", opNumber: "OP-240070", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    }
  ];

  // Store static rows
  state.patients = [...staticPatients];

  // Set up collections
  state.appointments = [];
  state.admissions = [];
  state.daycareAdmissions = [];
  state.billing = [];

  // Seed canonical bed mappings for all 25 patients
  var _staticBedMap = {
    'SH-2026-04821': { bed: 'GWM-101-B1',  wardKey: 'GENERAL-WARD-M', wardName: 'General Ward (Male)' },
    'SH-2026-04803': { bed: 'PVT-301',     wardKey: 'PRIVATE',         wardName: 'Private Room' },
    'SH-2026-04799': { bed: 'CCU-B1',      wardKey: 'CCU',             wardName: 'Critical Care Unit' },
    'SH-2026-04788': { bed: 'CCU-B2',      wardKey: 'CCU',             wardName: 'Critical Care Unit' },
    'SH-2026-04810': { bed: 'GWF-103-B1',  wardKey: 'GENERAL-WARD-F',  wardName: 'General Ward (Female)' },
    'SH-2026-04790': { bed: 'CCU-B3',      wardKey: 'CCU',             wardName: 'Critical Care Unit' },
    'SH-2026-04831': { bed: 'SP-201-A',    wardKey: 'SEMI-PRIVATE',    wardName: 'Semi-Private Ward' },
    'SH-2026-04768': { bed: 'SP-201-B',    wardKey: 'SEMI-PRIVATE',    wardName: 'Semi-Private Ward' },
    'SH-2026-04798': { bed: 'ICCU-B1',     wardKey: 'ICCU',            wardName: 'Intensive Cardiac Care Unit' },
    'SH-2026-04850': { bed: 'GWM-101-B2',  wardKey: 'GENERAL-WARD-M',  wardName: 'General Ward (Male)' },
    'SH-2026-04822': { bed: 'DC-BED-1',    wardKey: 'DAYCARE',         wardName: 'Daycare Unit' },
    'SH-2026-04812': { bed: 'DC-BED-2',    wardKey: 'DAYCARE',         wardName: 'Daycare Unit' },
    'SH-2026-04801': { bed: 'DC-BED-3',    wardKey: 'DAYCARE',         wardName: 'Daycare Unit' },
    'SH-2026-04755': { bed: 'ER-1-B1',     wardKey: 'EMERGENCY',       wardName: 'Emergency Ward' },
    'SH-2026-04870': { bed: 'ER-1-B2',     wardKey: 'EMERGENCY',       wardName: 'Emergency Ward' }
  };

  state.patients.forEach(function(p, idx) {
    var mapping = _staticBedMap[p.uhid];
    if (mapping) {
      p.bed = mapping.bed;
      if (p.type !== 'OPD') p.ward = mapping.wardName;
      state.bedsStatus[mapping.bed] = {
        wardKey:     mapping.wardKey,
        status:      (p.status === 'Discharged') ? 'Available' : 'Occupied',
        patientUhid: p.uhid,
        patientName: p.name,
        doctorName:  p.primaryConsultant || '',
        diagnosis:   (p.clinicalData && p.clinicalData.diagnosis) || '',
        notes:       'Admitted under ' + (p.primaryConsultant || '')
      };
      
      // Ensure a matching active admission record exists for IPD
      if (p.type === 'IPD' && p.status !== 'Discharged') {
        state.admissions.push({
          id: 'ADM-SEED-' + p.uhid,
          uhid: p.uhid,
          patientName: p.name,
          doctorName: p.primaryConsultant || '',
          ward: mapping.wardKey,
          bed: mapping.bed,
          date: window._HIS_DATE(p.los || 1),
          status: 'Active'
        });
      }

      // Add Daycare Admissions
      if (p.type === "Daycare") {
        state.daycareAdmissions.push({
          patient: p,
          bedId: mapping.bed,
          ward: 'Daycare Ward',
          bedNo: mapping.bed,
          consultantName: p.primaryConsultant,
          procedureName: 'Evaluation checkup',
          admissionType: 'Daycare',
          admissionTimestamp: new Date().toISOString(),
          status: p.status === 'Discharged' ? 'Cleared & Discharged' : 'Registered',
          dischargeClearances: { clinical: p.status === 'Discharged', billing: p.status === 'Discharged', summaryReady: p.status === 'Discharged' }
        });
      }
    }

    // Add OPD Appointments
    if (p.type === "OPD") {
      state.appointments.push({
        id: `APT${6000 + idx}`,
        uhid: p.uhid,
        patientName: p.name,
        doctorName: p.primaryConsultant,
        deptName: p.department,
        time: "10:30 AM",
        date: window._HIS_DATE(1),
        status: p.status === "Scheduled" ? "Scheduled" : (p.status === "Checked In" ? "Arrived" : "Completed"),
        mobile: p.mobile,
        gender: p.gender,
        age: p.age,
        visitType: "OPD Regular",
        checkedInTime: "09:45 AM"
      });
    }

    // Add Invoices
    state.billing.push({
      id: `INV${7000 + idx}`,
      uhid: p.uhid,
      patientName: p.name,
      amount: 1500 + (idx * 250) % 8000,
      paid: p.status === "Discharged" ? 1500 + (idx * 250) % 8000 : 0,
      status: p.status === "Discharged" ? "Paid" : "Pending",
      date: window._HIS_DATE(1),
      items: [
        { desc: "General Consultation Fee", qty: 1, rate: 800, total: 800 },
        { desc: "Facility Support Charges", qty: 1, rate: 700 + (idx * 250) % 7200, total: 700 + (idx * 250) % 7200 }
      ]
    });
  });

  // ── SEED LAB ORDERS (cross-module: EMR → Lab Dashboard) ─────────────────
  if (!state.labOrders || state.labOrders.length === 0) {
    state.labOrders = [
      { id: 'LO-001', uhid: 'SH-2026-04821', patientName: 'Rajesh Kumar',     ward: 'GW(M)-409',   test: 'Troponin I (hs)',         dept: 'Biochemistry',     tube: 'yellow',   priority: 'Urgent',  orderedBy: 'Dr. Srinivasan', orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0101' },
      { id: 'LO-002', uhid: 'SH-2026-04821', patientName: 'Rajesh Kumar',     ward: 'GW(M)-409',   test: 'ECG (Report)',             dept: 'Cardiology',       tube: 'none',     priority: 'Routine', orderedBy: 'Dr. Srinivasan', orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0102' },
      { id: 'LO-003', uhid: 'SH-2026-04799', patientName: 'Mohammed Iqbal',   ward: 'CCU-BED-01',  test: 'LFT + KFT',               dept: 'Biochemistry',     tube: 'yellow',   priority: 'Routine', orderedBy: 'Dr. Mehta',      orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0103' },
      { id: 'LO-004', uhid: 'SH-2026-04810', patientName: 'Fatima Begum',     ward: 'GW(F)-414',   test: 'HbA1c + FBS',             dept: 'Biochemistry',     tube: 'lavender', priority: 'Urgent',  orderedBy: 'Dr. Ramesh Iyer', orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0104' },
      { id: 'LO-005', uhid: 'SH-2026-04788', patientName: 'Arun Pillai',      ward: 'CCU-BED-02',  test: 'Serum Creatinine + eGFR', dept: 'Biochemistry',     tube: 'yellow',   priority: 'Routine', orderedBy: 'Dr. Srinivasan', orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0105' },
      { id: 'LO-006', uhid: 'SH-2026-04755', patientName: 'Deepak Verma',     ward: 'EMG-01',      test: 'CBC + ABG',               dept: 'Haematology',      tube: 'lavender', priority: 'STAT',    orderedBy: 'Dr. Fatima Sheikh', orderedAt: window._HIS_DATE(0), status: 'Pending', accNo: 'SPEC-TODAY-0106' },
      { id: 'LO-007', uhid: 'SH-2026-04790', patientName: 'Vikram Singh',     ward: 'CCU-BED-03',  test: 'Lipid Profile',           dept: 'Biochemistry',     tube: 'yellow',   priority: 'Routine', orderedBy: 'Dr. Mehta',      orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0107' },
      { id: 'LO-008', uhid: 'SH-2026-04831', patientName: 'Anitha Rao',       ward: 'SP-301',      test: 'Complete Blood Count',    dept: 'Haematology',      tube: 'lavender', priority: 'Routine', orderedBy: 'Dr. Priya Nair', orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0108' },
      { id: 'LO-009', uhid: 'SH-2026-04798', patientName: 'Arjun Nair',       ward: 'ICCU-BED-01', test: 'Cardiac Enzymes Panel',   dept: 'Biochemistry',     tube: 'yellow',   priority: 'Urgent',  orderedBy: 'Dr. Anand',      orderedAt: window._HIS_DATE(0), status: 'In Progress', accNo: 'SPEC-TODAY-0109' },
      { id: 'LO-010', uhid: 'SH-2026-04817', patientName: 'Sunita Sharma',    ward: 'OPD',         test: 'Urine Routine + Microscopy', dept: 'Clinical Path', tube: 'yellow-cap', priority: 'Routine', orderedBy: 'Dr. Priya Nair', orderedAt: window._HIS_DATE(0), status: 'Pending', accNo: 'SPEC-TODAY-0110' }
    ];
  }

  // ── SEED RAD ORDERS (cross-module: EMR → Radiology Dashboard) ───────────
  if (!state.radOrders || state.radOrders.length === 0) {
    state.radOrders = [
      { id: 'RO-001', uhid: 'SH-2026-04821', patientName: 'Rajesh Kumar',   ward: 'GW(M)-409',   study: 'ECG Treadmill Stress Test',    modality: 'ECG',       priority: 'Routine', orderedBy: 'Dr. Srinivasan',   orderedAt: window._HIS_DATE(0), status: 'Scheduled', room: 'ROOM-X1', studyId: 'STUDY-SEED-001' },
      { id: 'RO-002', uhid: 'SH-2026-04799', patientName: 'Mohammed Iqbal', ward: 'CCU-BED-01',  study: 'X-Ray Chest PA View',          modality: 'X-Ray',     priority: 'Urgent',  orderedBy: 'Dr. Mehta',        orderedAt: window._HIS_DATE(0), status: 'Scheduled', room: 'ROOM-X1', studyId: 'STUDY-SEED-002' },
      { id: 'RO-003', uhid: 'SH-2026-04755', patientName: 'Deepak Verma',   ward: 'EMG-01',      study: 'CT Brain Non-Contrast',        modality: 'CT Scan',   priority: 'STAT',    orderedBy: 'Dr. Fatima Sheikh', orderedAt: window._HIS_DATE(0), status: 'Called',    room: 'ROOM-CT1', studyId: 'STUDY-SEED-003' },
      { id: 'RO-004', uhid: 'SH-2026-04788', patientName: 'Arun Pillai',    ward: 'CCU-BED-02',  study: 'USG Abdomen (kidneys)',        modality: 'Ultrasound',priority: 'Routine', orderedBy: 'Dr. Srinivasan',   orderedAt: window._HIS_DATE(0), status: 'Scheduled', room: 'ROOM-U1', studyId: 'STUDY-SEED-004' },
      { id: 'RO-005', uhid: 'SH-2026-04831', patientName: 'Anitha Rao',     ward: 'SP-301',      study: 'USG Pelvis (Follow-up)',       modality: 'Ultrasound',priority: 'Routine', orderedBy: 'Dr. Priya Nair',   orderedAt: window._HIS_DATE(0), status: 'Scheduled', room: 'ROOM-U2', studyId: 'STUDY-SEED-005' }
    ];
  }

  // ── SEED VALIDATION RULES (Safety Rules / ruleManager module) ───────────
  if (!state.validationRules || state.validationRules.length === 0) {
    state.validationRules = [
      { id: 'RULE01', name: 'Drug-Allergy Conflict Check', category: 'Clinical', severity: 'Critical Safety Alert', trigger: 'Prescription', dept: 'Clinical EMR', status: 'Active', version: '1.2.0' },
      { id: 'RULE02', name: 'ABO Blood Compatibility', category: 'Blood Bank', severity: 'Hard Stop', trigger: 'Transfusion Issue', dept: 'Blood Bank', status: 'Active', version: '2.0.1' },
      { id: 'RULE03', name: 'Duplicate Patient Detection', category: 'Registration', severity: 'Warning', trigger: 'Demographic Entry', dept: 'Registration', status: 'Active', version: '1.0.4' },
      { id: 'RULE04', name: 'NEWS2 Sepsis Warning', category: 'Vitals', severity: 'Critical Safety Alert', trigger: 'Vitals Entry', dept: 'Nursing', status: 'Active', version: '1.1.2' },
      { id: 'RULE05', name: 'Drug-Drug Interaction Check', category: 'Pharmacy', severity: 'Hard Stop', trigger: 'Dispensing', dept: 'Pharmacy', status: 'Active', version: '2.1.0' },
      { id: 'RULE06', name: 'Surgical Checklist Timeout Validation', category: 'OT/Surgery', severity: 'Hard Stop', trigger: 'Incision Clear', dept: 'Surgery', status: 'Active', version: '1.0.0' },
      { id: 'RULE07', name: 'Bed Housekeeping Safety Constraint', category: 'ATD', severity: 'Hard Stop', trigger: 'Bed Status Update', dept: 'Admissions Desk', status: 'Active', version: '1.0.0' }
    ];
  }

  // Save to local storage for persistence across views
  localStorage.setItem('saronil_patients', JSON.stringify(state.patients));
  localStorage.setItem('saronil_doctors', JSON.stringify(state.doctors));
  localStorage.setItem('saronil_nurses', JSON.stringify(state.nurses));
  localStorage.setItem('saronil_staff', JSON.stringify(state.staff));

  // Seed reports and MIS datasets
  seedReports();
  seedBillingGapModules();

  console.log(`Synchronized database seeded successfully: ${state.patients.length} patients, ${state.doctors.length} doctors, ${state.nurses.length} nurses, ${state.staff.length} staff.`);

  function seedReports() {
    if (!state.reportCatalog || state.reportCatalog.length === 0) {
      state.reportCatalog = [
        {
          report_id: "REP001",
          name: "Billing & Revenue Summary",
          category: "Financial/Revenue Cycle",
          source_module: "billing",
          default_filters: "date_range",
          output_formats: ["CSV", "PDF"],
          frequency_type: "on-demand",
          is_statutory: false
        },
        {
          report_id: "REP002",
          name: "GST Returns GSTR-1 File",
          category: "Regulatory & Statutory Compliance",
          source_module: "billing",
          default_filters: "date_range",
          output_formats: ["CSV"],
          frequency_type: "scheduled",
          is_statutory: true
        },
        {
          report_id: "REP009",
          name: "IPD Ward Bed Occupancy",
          category: "Operational/Patient Flow",
          source_module: "patients",
          default_filters: "date_range",
          output_formats: ["CSV", "PDF"],
          frequency_type: "on-demand",
          is_statutory: false
        },
        {
          report_id: "REP021",
          name: "NDPS Narcotic Register",
          category: "Regulatory & Statutory Compliance",
          source_module: "Pharmacy",
          default_filters: "date_range",
          output_formats: ["CSV"],
          frequency_type: "scheduled",
          is_statutory: true
        }
      ];
      localStorage.setItem('saronil_report_catalog', JSON.stringify(state.reportCatalog));
    }
    if (!state.reportAuditLogs || state.reportAuditLogs.length === 0) {
      state.reportAuditLogs = [
        {
          generated_at: new Date().toISOString(),
          generated_by: "Dr. Amit Verma (Super Admin)",
          report_name: "Billing & Revenue Summary",
          output_format: "CSV"
        },
        {
          generated_at: new Date().toISOString(),
          generated_by: "Naveen Trivedi (Finance)",
          report_name: "GST Returns GSTR-1 File",
          output_format: "CSV"
        }
      ];
      localStorage.setItem('saronil_report_audit_logs', JSON.stringify(state.reportAuditLogs));
    }
    if (!state.fieldExposures || state.fieldExposures.length === 0) {
      state.fieldExposures = [
        { module_name: "billing", field_name: "invoiceNo", sensitivity_level: "Low", exposed: true },
        { module_name: "billing", field_name: "uhid", sensitivity_level: "Medium", exposed: true },
        { module_name: "billing", field_name: "patientName", sensitivity_level: "Medium", exposed: true },
        { module_name: "billing", field_name: "totalAmount", sensitivity_level: "Medium", exposed: true },
        { module_name: "billing", field_name: "gstPaid", sensitivity_level: "Low", exposed: true },
        { module_name: "billing", field_name: "discount", sensitivity_level: "Low", exposed: true },
        { module_name: "patients", field_name: "name", sensitivity_level: "Medium", exposed: true },
        { module_name: "patients", field_name: "mobile", sensitivity_level: "High", exposed: true },
        { module_name: "patients", field_name: "allergies", sensitivity_level: "High", exposed: true },
        { module_name: "patients", field_name: "bloodGroup", sensitivity_level: "Medium", exposed: true },
        { module_name: "appointments", field_name: "id", sensitivity_level: "Low", exposed: true },
        { module_name: "appointments", field_name: "doctorName", sensitivity_level: "Low", exposed: true },
        { module_name: "appointments", field_name: "status", sensitivity_level: "Low", exposed: true }
      ];
      localStorage.setItem('saronil_field_exposures', JSON.stringify(state.fieldExposures));
    }
    if (!state.reportSchedules || state.reportSchedules.length === 0) {
      state.reportSchedules = [
        {
          schedule_id: "SCH001",
          report_id: "REP002",
          report_name: "GST Returns GSTR-1 File",
          frequency: "Monthly",
          recipients: "accounts@saronil.com",
          status: "Active",
          last_run: "04 Jul 2026 · 08:00 PM"
        }
      ];
      localStorage.setItem('saronil_report_schedules', JSON.stringify(state.reportSchedules));
    }
    if (!state.customReportTemplates) {
      state.customReportTemplates = [];
      localStorage.setItem('saronil_custom_templates', JSON.stringify(state.customReportTemplates));
    }
    if (!state.reportArchive || state.reportArchive.length === 0) {
      state.reportArchive = [
        {
          archive_id: "ARC001",
          name: "Billing & Revenue Summary",
          filters_applied: "Date Range: 2026-06-01 to 2026-06-30",
          generated_by: "Naveen Trivedi (Finance)",
          generated_at: new Date().toISOString(),
          record_count: 145,
          output_format: "CSV"
        },
        {
          archive_id: "ARC002",
          name: "GST Returns GSTR-1 File",
          filters_applied: "Month: June 2026",
          generated_by: "Naveen Trivedi (Finance)",
          generated_at: new Date().toISOString(),
          record_count: 145,
          output_format: "CSV"
        }
      ];
      localStorage.setItem('saronil_report_archive', JSON.stringify(state.reportArchive));
    }
  }

  function seedBillingGapModules() {
    if (!localStorage.getItem('saronil_outstandingBills') || !localStorage.getItem('saronil_suspenseReceipts')) {
      state.outstandingBills = [
        { bill_id: "INV-8021", UHID: "SH-2026-04821", patient_name: "Rajesh Kumar", admission_type: "IPD", bill_amount: 42500, amount_received: 30000, balance_due: 12500, bill_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], payer_type: "Insurance", reason_code: "TPA pending", aging_days: 5, status: "Unpaid", assigned_executive: "Executive Ankit" },
        { bill_id: "INV-8022", UHID: "SH-2026-04799", patient_name: "Mohammed Iqbal", admission_type: "IPD", bill_amount: 78000, amount_received: 50000, balance_due: 28000, bill_date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0], payer_type: "Insurance", reason_code: "disputed line item", aging_days: 12, status: "Unpaid", assigned_executive: "Executive Sonia" },
        { bill_id: "INV-8023", UHID: "SH-2026-04790", patient_name: "Vikram Singh", admission_type: "IPD", bill_amount: 82000, amount_received: 10000, balance_due: 72000, bill_date: new Date(Date.now() - 22 * 86400000).toISOString().split('T')[0], payer_type: "Self Pay", reason_code: "cashless authorization pending", aging_days: 22, status: "Unpaid", assigned_executive: "Executive Ankit" },
        { bill_id: "INV-8024", UHID: "SH-2026-04812", patient_name: "Sunita Sharma", admission_type: "IPD", bill_amount: 35000, amount_received: 5000, balance_due: 30000, bill_date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0], payer_type: "Self Pay", reason_code: "DAMA/absconded", aging_days: 45, status: "Unpaid", assigned_executive: "Executive Sonia" },
        { bill_id: "INV-8025", UHID: "SH-2026-04822", patient_name: "Ramesh Gupta", admission_type: "IPD", bill_amount: 95000, amount_received: 15000, balance_due: 80000, bill_date: new Date(Date.now() - 75 * 86400000).toISOString().split('T')[0], payer_type: "Self Pay", reason_code: "awaiting relative", aging_days: 75, status: "Unpaid", assigned_executive: "Executive Ankit" }
      ];
      state.followUpLogs = [
        { log_id: "LOG-001", bill_id: "INV-8021", executive_id: "Executive Ankit", contact_channel: "Call", contact_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], notes: "Spoke to relative. They will check with TPA coordinator.", next_action_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0] },
        { log_id: "LOG-002", bill_id: "INV-8024", executive_id: "Executive Sonia", contact_channel: "SMS", contact_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], notes: "Sent payment reminder SMS. No response.", next_action_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] }
      ];
      state.writeOffRecords = [];
      state.suspenseReceipts = [
        { receipt_id: "REC-SUS-001", amount: 80000, receipt_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], payment_mode: "NEFT", payer_name: "Astra Healthcare", UTR_reference: "UTR882910X", source_account: "XXXXXXXX9021", match_status: "suggested", matched_bill_id: "INV-8025" },
        { receipt_id: "REC-SUS-002", amount: 12500, receipt_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], payment_mode: "UPI", payer_name: "Rajesh Kumar", UTR_reference: "UTR992310Y", source_account: "XXXXXXXX1102", match_status: "suggested", matched_bill_id: "INV-8021" },
        { receipt_id: "REC-SUS-003", amount: 150000, receipt_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], payment_mode: "RTGS", payer_name: "SBI Insurer Account", UTR_reference: "UTR002931Z", source_account: "XXXXXXXX4430", match_status: "unmatched", matched_bill_id: null },
        { receipt_id: "REC-SUS-004", amount: 5000, receipt_date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0], payment_mode: "NEFT", payer_name: "Anonymous Patient Payer", UTR_reference: "UTR112030A", source_account: "XXXXXXXX8891", match_status: "unmatched", matched_bill_id: null },
        { receipt_id: "REC-SUS-005", amount: 112000, receipt_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], payment_mode: "NEFT", payer_name: "Star Health TPA Settlement", UTR_reference: "UTR882190B", source_account: "XXXXXXXX5500", match_status: "unmatched", matched_bill_id: null }
      ];
      state.matchAttemptLogs = [];
      state.bulkAllocations = [];
      state.gstRateConfigs = [
        { room_category: "GENERAL-WARD-M", is_icu_type: false, daily_tariff: 1500, tax_trigger_threshold: 5000 },
        { room_category: "GENERAL-WARD-F", is_icu_type: false, daily_tariff: 1500, tax_trigger_threshold: 5000 },
        { room_category: "SEMI-PRIVATE", is_icu_type: false, daily_tariff: 3000, tax_trigger_threshold: 5000 },
        { room_category: "PRIVATE", is_icu_type: false, daily_tariff: 6000, tax_trigger_threshold: 5000 },
        { room_category: "DELUXE", is_icu_type: false, daily_tariff: 8000, tax_trigger_threshold: 5000 },
        { room_category: "ICU", is_icu_type: true, daily_tariff: 12000, tax_trigger_threshold: 5000 }
      ];
      state.gstInvoiceSeries = [
        { gst_invoice_id: "GST-INV-2026-0001", bill_id: "INV-8021", buyer_gstin: "29STARH1234F1Z9", invoice_series: "GST-INV-2026-0001", invoice_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0] },
        { gst_invoice_id: "GST-INV-2026-0002", bill_id: "INV-8024", buyer_gstin: null, invoice_series: "GST-INV-2026-0002", invoice_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0] }
      ];

      state.gstinMaster = [
        { gstin: "29AAAAA0000A1Z5", name: "Saronil Super Specialty Hospital (KA)", location: "Bengaluru, Karnataka", threshold: 20000000 },
        { gstin: "29BBBBB1111B1Z6", name: "FertiCare IVF Center (KA)", location: "Bengaluru, Karnataka", threshold: 20000000 }
      ];
      state.nonBillingRevenue = [
        { entry_id: "NBR-001", period: "2026-07", revenue_type: "Hospital Cafeteria Lease", amount: 150000, tax_classification: "Taxable (18% GST)", cgst: 13500, sgst: 13500, igst: 0, gstin: "29AAAAA0000A1Z5", date: "2026-07-01" },
        { entry_id: "NBR-002", period: "2026-07", revenue_type: "Visitor Parking Collection", amount: 85000, tax_classification: "Taxable (18% GST)", cgst: 7650, sgst: 7650, igst: 0, gstin: "29AAAAA0000A1Z5", date: "2026-07-03" },
        { entry_id: "NBR-003", period: "2026-07", revenue_type: "External Diagnostic Referrals", amount: 120000, tax_classification: "Exempt (0% GST)", cgst: 0, sgst: 0, igst: 0, gstin: "29AAAAA0000A1Z5", date: "2026-07-05" },
        { entry_id: "NBR-004", period: "2026-07", revenue_type: "Scrap & Waste Sale", amount: 35000, tax_classification: "Taxable (18% GST)", cgst: 3150, sgst: 3150, igst: 0, gstin: "29AAAAA0000A1Z5", date: "2026-07-10" },
        { entry_id: "NBR-005", period: "2026-07", revenue_type: "Staff Quarters Rent", amount: 90000, tax_classification: "Exempt (0% GST)", cgst: 0, sgst: 0, igst: 0, gstin: "29AAAAA0000A1Z5", date: "2026-07-12" },
        { entry_id: "NBR-006", period: "2026-07", revenue_type: "Surgical Equipment Rental", amount: 200000, tax_classification: "Taxable (12% GST)", cgst: 12000, sgst: 12000, igst: 0, gstin: "29BBBBB1111B1Z6", date: "2026-07-04" }
      ];
      state.vendorInvoices = [
        { invoice_id: "VND-001", vendor_gstin: "29MNO1234A1Z0", vendor_name: "Apex Pharma Distributors", invoice_number: "INV-9921", invoice_date: "2026-07-02", taxable_value: 300000, tax_amount: 36000, hsn_sac: "3004", itc_eligibility_status: "Common Credit - Rule 42/43", rcm_applicable: false, match_status: "matched" },
        { invoice_id: "VND-002", vendor_gstin: "29XYZ5678B1Z1", vendor_name: "Star Health Insurance Ltd", invoice_number: "INS-00291", invoice_date: "2026-07-04", taxable_value: 120000, tax_amount: 21600, hsn_sac: "9971", itc_eligibility_status: "Ineligible - Sec 17(5) Blocked", rcm_applicable: false, match_status: "matched", notes: "Employee Health Insurance (Non-statutory)" },
        { invoice_id: "VND-003", vendor_gstin: "29AAA4455C1Z2", vendor_name: "Metropolis Logistics & GTA", invoice_number: "GTA-88219", invoice_date: "2026-07-05", taxable_value: 50000, tax_amount: 2500, hsn_sac: "9965", itc_eligibility_status: "Common Credit - Rule 42/43", rcm_applicable: true, match_status: "matched", notes: "Reverse Charge - Goods Transport Agency" },
        { invoice_id: "VND-004", vendor_gstin: "29BBB9900D1Z3", vendor_name: "MediClean Waste Sol.", invoice_number: "MCW-77218", invoice_date: "2026-07-08", taxable_value: 80000, tax_amount: 14400, hsn_sac: "9994", itc_eligibility_status: "Eligible", rcm_applicable: false, match_status: "matched" },
        { invoice_id: "VND-005", vendor_gstin: "29CCC8877E1Z4", vendor_name: "CaterCare Catering Services", invoice_number: "CAT-3341", invoice_date: "2026-07-10", taxable_value: 45000, tax_amount: 8100, hsn_sac: "9963", itc_eligibility_status: "Ineligible - Sec 17(5) Blocked", rcm_applicable: false, match_status: "matched", notes: "Visitor Cafe/Staff lunches - Blocked under Sec 17(5)(b)(i)" },
        { invoice_id: "VND-006", vendor_gstin: "29DDD6655F1Z5", vendor_name: "Astra Motors Ltd", invoice_number: "AST-2219", invoice_date: "2026-07-12", taxable_value: 1500000, tax_amount: 270000, hsn_sac: "8703", itc_eligibility_status: "Ineligible - Sec 17(5) Blocked", rcm_applicable: false, match_status: "matched", notes: "Director's luxury sedan - Blocked under Sec 17(5)(a)" },
        { invoice_id: "VND-007", vendor_gstin: "29DDD6655F1Z5", vendor_name: "Astra Motors Ltd", invoice_number: "AST-2220", invoice_date: "2026-07-13", taxable_value: 2800000, tax_amount: 336000, hsn_sac: "8702", itc_eligibility_status: "Eligible", rcm_applicable: false, match_status: "matched", notes: "ICU Patient Ambulance (Exempted from 17(5) block)" },
        { invoice_id: "VND-008", vendor_gstin: "29ERR1111A1Z9", vendor_name: "Error-prone Equipment Supplier", invoice_number: "ERR-0019", invoice_date: "2026-07-15", taxable_value: 100000, tax_amount: 18000, hsn_sac: "9018", itc_eligibility_status: "Eligible", rcm_applicable: false, match_status: "mismatched", discrepancy: "Invoice value matches but vendor has not filed GSTR-1 / missing in GSTR-2B" }
      ];
      state.gstNotices = [
        { notice_id: "GST-2026-N01", notice_type: "ASMT-10 (Scrutiny of Returns)", received_date: "2026-06-18", response_deadline: "2026-07-18", assigned_to: "Kavita Iyer (Head of Accounts)", status: "Pending Response", description: "Discrepancy in GSTR-3B vs GSTR-2A input tax credit claims for FY 2025-26." },
        { notice_id: "GST-2026-N02", notice_type: "DRC-01 (Summary of Show Cause Notice)", received_date: "2026-05-10", response_deadline: "2026-06-10", assigned_to: "Kavita Iyer (Head of Accounts)", status: "Replied (Awaiting Order)", description: "Tax demand on canteen services credit apportionment under Rule 42. Written response filed on 2026-06-08." }
      ];
      state.returnFilings = [
        { return_id: "RET-2026-06-1", return_type: "GSTR-1", period: "2026-06", gstin: "29AAAAA0000A1Z5", status: "filed", filed_by: "Kavita Iyer", filed_date: "2026-07-10", ARN: "AR29072600291A", signoff_log: "Approved & Signed off by Kavita Iyer (Head of Accounts) on 2026-07-10 10:45 AM" },
        { return_id: "RET-2026-06-2", return_type: "GSTR-3B", period: "2026-06", gstin: "29AAAAA0000A1Z5", status: "filed", filed_by: "Kavita Iyer", filed_date: "2026-07-12", ARN: "AR29072600350B", signoff_log: "Approved & Signed off by Kavita Iyer (Head of Accounts) on 2026-07-12 02:15 PM" },
        { return_id: "RET-2026-07-1", return_type: "GSTR-1", period: "2026-07", gstin: "29AAAAA0000A1Z5", status: "draft", filed_by: "", filed_date: "", ARN: "", signoff_log: "" },
        { return_id: "RET-2026-07-2", return_type: "GSTR-3B", period: "2026-07", gstin: "29AAAAA0000A1Z5", status: "draft", filed_by: "", filed_date: "", ARN: "", signoff_log: "" }
      ];
      state.complianceCalendar = [
        { entry_id: "CAL-001", period: "2026-07", return_type: "GSTR-1", due_date: "2026-08-11", status: "Upcoming", details: "Outward supply invoice upload" },
        { entry_id: "CAL-002", period: "2026-07", return_type: "GSTR-3B", due_date: "2026-08-20", status: "Upcoming", details: "Monthly tax consolidation, input offsets, and cash payment challan" },
        { entry_id: "CAL-003", period: "FY 2025-26", return_type: "GSTR-9", due_date: "2026-12-31", status: "Upcoming", details: "Annual GST return consolidation" },
        { entry_id: "CAL-004", period: "FY 2025-26", return_type: "GSTR-9C", due_date: "2026-12-31", status: "Upcoming", details: "Annual Reconciliation Statement (Statutory audit certified)" }
      ];

      state.pantryLocations = [
        { code: "LOC-DRY-A", name: "Dry Store A", type: "Store Room", temp_category: "Ambient", department: "Dietary", capacity: "500 kg", status: "Active" },
        { code: "LOC-DRY-B", name: "Dry Store B", type: "Store Room", temp_category: "Ambient", department: "Dietary", capacity: "300 kg", status: "Active" },
        { code: "LOC-COLD-1", name: "Cold Storage 1", type: "Cold Storage", temp_category: "Refrigerated", department: "Dietary", capacity: "200 L", status: "Active" },
        { code: "LOC-COLD-2", name: "Cold Storage 2", type: "Cold Storage", temp_category: "Refrigerated", department: "Dietary", capacity: "200 L", status: "Active" },
        { code: "LOC-FREEZE-1", name: "Deep Freezer 1", type: "Deep Freezer", temp_category: "Frozen", department: "Dietary", capacity: "150 L", status: "Active" },
        { code: "LOC-PHARM-1", name: "Pharmacy Counter A", type: "Pharmacy Counter", temp_category: "Ambient", department: "Pharmacy", capacity: "100 kg", status: "Active" }
      ];

      state.pantryInventory = [
        { item_id: "INV-001", name: "Basmati Rice", category: "dry", batch_lot_no: "BATCH-R-01", current_stock: 120, unit: "kg", storage_location_id: "LOC-DRY-A", expiry_date: "2026-09-10", reorder_level: 50, pricing: { standard: 85, subsidized: 50, free: 0 } },
        { item_id: "INV-001-B2", name: "Basmati Rice", category: "dry", batch_lot_no: "BATCH-R-02", current_stock: 80, unit: "kg", storage_location_id: "LOC-DRY-A", expiry_date: "2026-11-20", reorder_level: 50, pricing: { standard: 85, subsidized: 50, free: 0 } },
        { item_id: "INV-002", name: "Fresh Milk", category: "dairy", batch_lot_no: "BATCH-M-01", current_stock: 45, unit: "L", storage_location_id: "LOC-COLD-1", expiry_date: "2026-07-13", reorder_level: 30, pricing: { standard: 60, subsidized: 35, free: 0 } },
        { item_id: "INV-002-B2", name: "Fresh Milk", category: "dairy", batch_lot_no: "BATCH-M-02", current_stock: 60, unit: "L", storage_location_id: "LOC-COLD-1", expiry_date: "2026-07-15", reorder_level: 30, pricing: { standard: 60, subsidized: 35, free: 0 } },
        { item_id: "INV-003", name: "Toned Curd", category: "dairy", batch_lot_no: "BATCH-C-01", current_stock: 15, unit: "kg", storage_location_id: "LOC-COLD-1", expiry_date: "2026-07-12", reorder_level: 20, pricing: { standard: 80, subsidized: 45, free: 0 } },
        { item_id: "INV-004", name: "Chicken Breast", category: "protein", batch_lot_no: "BATCH-CH-01", current_stock: 10, unit: "kg", storage_location_id: "LOC-COLD-2", expiry_date: "2026-07-12", reorder_level: 15, pricing: { standard: 220, subsidized: 130, free: 0 } },
        { item_id: "INV-004-B2", name: "Chicken Breast", category: "protein", batch_lot_no: "BATCH-CH-02", current_stock: 25, unit: "kg", storage_location_id: "LOC-COLD-2", expiry_date: "2026-07-16", reorder_level: 15, pricing: { standard: 220, subsidized: 130, free: 0 } },
        { item_id: "INV-005", name: "Whole Wheat Flour", category: "dry", batch_lot_no: "BATCH-W-01", current_stock: 90, unit: "kg", storage_location_id: "LOC-DRY-B", expiry_date: "2026-12-05", reorder_level: 40, pricing: { standard: 45, subsidized: 25, free: 0 } },
        { item_id: "INV-006", name: "Sona Masuri Rice", category: "dry", batch_lot_no: "BATCH-SM-01", current_stock: 150, unit: "kg", storage_location_id: "LOC-DRY-A", expiry_date: "2026-10-15", reorder_level: 60, pricing: { standard: 65, subsidized: 40, free: 0 } },
        { item_id: "INV-007", name: "Toor Dal", category: "dry", batch_lot_no: "BATCH-TD-01", current_stock: 55, unit: "kg", storage_location_id: "LOC-DRY-B", expiry_date: "2026-09-30", reorder_level: 25, pricing: { standard: 140, subsidized: 90, free: 0 } },
        { item_id: "INV-008", name: "Moong Dal", category: "dry", batch_lot_no: "BATCH-MD-01", current_stock: 40, unit: "kg", storage_location_id: "LOC-DRY-B", expiry_date: "2026-10-01", reorder_level: 20, pricing: { standard: 130, subsidized: 85, free: 0 } },
        { item_id: "INV-009", name: "Paneer / Cottage Cheese", category: "dairy", batch_lot_no: "BATCH-PN-01", current_stock: 22, unit: "kg", storage_location_id: "LOC-COLD-1", expiry_date: "2026-07-14", reorder_level: 10, pricing: { standard: 350, subsidized: 200, free: 0 } },
        { item_id: "INV-010", name: "Eggs", category: "protein", batch_lot_no: "BATCH-EG-01", current_stock: 12, unit: "tray", storage_location_id: "LOC-COLD-2", expiry_date: "2026-07-20", reorder_level: 5, pricing: { standard: 180, subsidized: 100, free: 0 } },
        { item_id: "INV-011", name: "Fresh Rohu Fish", category: "protein", batch_lot_no: "BATCH-RF-01", current_stock: 8, unit: "kg", storage_location_id: "LOC-FREEZE-1", expiry_date: "2026-07-18", reorder_level: 10, pricing: { standard: 280, subsidized: 180, free: 0 } },
        { item_id: "INV-012", name: "Refined Sunflower Oil", category: "grocery", batch_lot_no: "BATCH-OIL-01", current_stock: 85, unit: "L", storage_location_id: "LOC-DRY-A", expiry_date: "2027-01-10", reorder_level: 30, pricing: { standard: 120, subsidized: 80, free: 0 } },
        { item_id: "INV-013", name: "Sugar", category: "grocery", batch_lot_no: "BATCH-SUG-01", current_stock: 65, unit: "kg", storage_location_id: "LOC-DRY-B", expiry_date: "2027-03-15", reorder_level: 25, pricing: { standard: 48, subsidized: 30, free: 0 } },
        { item_id: "INV-014", name: "Iodized Salt", category: "grocery", batch_lot_no: "BATCH-SLT-01", current_stock: 30, unit: "kg", storage_location_id: "LOC-DRY-B", expiry_date: "2028-06-01", reorder_level: 10, pricing: { standard: 25, subsidized: 15, free: 0 } },
        { item_id: "INV-015", name: "Turmeric / Haldi Powder", category: "grocery", batch_lot_no: "BATCH-HLD-01", current_stock: 15, unit: "kg", storage_location_id: "LOC-DRY-B", expiry_date: "2027-05-10", reorder_level: 5, pricing: { standard: 160, subsidized: 100, free: 0 } },
        { item_id: "INV-016", name: "Whey Protein Isolate", category: "clinical", batch_lot_no: "BATCH-WPI-01", current_stock: 25, unit: "box", storage_location_id: "LOC-DRY-A", expiry_date: "2027-06-30", reorder_level: 8, pricing: { standard: 2800, subsidized: 1800, free: 0 } },
        { item_id: "INV-017", name: "Enteral Formula", category: "clinical", batch_lot_no: "BATCH-ENT-01", current_stock: 30, unit: "tin", storage_location_id: "LOC-DRY-A", expiry_date: "2027-04-12", reorder_level: 10, pricing: { standard: 850, subsidized: 500, free: 0 } },
        { item_id: "INV-018", name: "Ragi Flour / Finger Millet", category: "clinical", batch_lot_no: "BATCH-RGI-01", current_stock: 40, unit: "kg", storage_location_id: "LOC-DRY-B", expiry_date: "2026-11-05", reorder_level: 15, pricing: { standard: 75, subsidized: 45, free: 0 } },
        { item_id: "INV-019", name: "Diabetic Sweetener", category: "clinical", batch_lot_no: "BATCH-SWT-01", current_stock: 12, unit: "packet", storage_location_id: "LOC-DRY-B", expiry_date: "2027-02-28", reorder_level: 4, pricing: { standard: 140, subsidized: 90, free: 0 } },
        { item_id: "INV-020", name: "Fresh Spinach / Palak", category: "vegetable", batch_lot_no: "BATCH-VEG-01", current_stock: 15, unit: "kg", storage_location_id: "LOC-COLD-1", expiry_date: "2026-07-14", reorder_level: 10, pricing: { standard: 40, subsidized: 25, free: 0 } },
        { item_id: "INV-021", name: "Fresh Tomatoes", category: "vegetable", batch_lot_no: "BATCH-VEG-02", current_stock: 20, unit: "kg", storage_location_id: "LOC-COLD-1", expiry_date: "2026-07-14", reorder_level: 12, pricing: { standard: 50, subsidized: 30, free: 0 } },
        { item_id: "INV-022", name: "Fresh Potatoes", category: "vegetable", batch_lot_no: "BATCH-VEG-03", current_stock: 50, unit: "kg", storage_location_id: "LOC-DRY-B", expiry_date: "2026-08-15", reorder_level: 20, pricing: { standard: 30, subsidized: 20, free: 0 } }
      ];

      state.inventoryMovementLog = [
        { log_id: "IML-001", timestamp: "2026-07-10 10:15 AM", item_name: "Fresh Milk", batch_lot_no: "BATCH-M-01", quantity: 100, unit: "L", from_location: "Supplier (Mother Dairy)", to_location: "LOC-COLD-1", type: "Stock Receipt", user: "Meena S.", department: "Dietary", reason: "Standard contract purchase delivery receipt", reference: "GRN-KIT-001" },
        { log_id: "IML-002", timestamp: "2026-07-11 08:30 AM", item_name: "Basmati Rice", batch_lot_no: "BATCH-R-01", quantity: 15, unit: "kg", from_location: "LOC-DRY-A", to_location: "Kitchen Production (Hot Kitchen)", type: "Stock Issue", user: "Meena S.", department: "Dietary", reason: "Breakfast Veg Thali preparation", reference: "IS-2407-018" }
      ];

      state.pantryProcurement = {
        purchaseOrders: [
          { po_id: "PO-KIT-001", vendor_id: "VND-FOOD-01", category: "dairy", item_list: "Fresh Milk × 100L", quantity: 100, contracted_rate: 60, order_date: "2026-07-08", expected_delivery_date: "2026-07-10", status: "delivered", auto_generated: false },
          { po_id: "PO-KIT-002", vendor_id: "VND-FOOD-02", category: "dry", item_list: "Basmati Rice × 200kg", quantity: 200, contracted_rate: 85, order_date: "2026-07-09", expected_delivery_date: "2026-07-13", status: "ordered", auto_generated: false }
        ],
        vendorMaster: [
          { vendor_id: "VND-FOOD-01", name: "Mother Dairy", category: "dairy", rate_contract_ref: "CON-F-001", contract_validity: "2026-12-31", rateTable: { "Fresh Milk": 60, "Toned Curd": 80 } },
          { vendor_id: "VND-FOOD-02", name: "Reliance Retail", category: "dry", rate_contract_ref: "CON-F-002", contract_validity: "2026-10-31", rateTable: { "Basmati Rice": 85, "Whole Wheat Flour": 45 } }
        ],
        grnEntries: [
          { grn_id: "GRN-KIT-001", po_id: "PO-KIT-001", item_id: "INV-002", quantity_received: 100, quality_check_status: "pass", temperature_check: "3.2°C", rejection_reason: null, received_by: "Meena S.", received_at: "2026-07-10 09:30 AM" }
        ]
      };

      state.cafeteriaBills = [
        { bill_id: "POS-001", payer_type: "visitor", staff_id: null, amount: 150, subsidy_applied: 0, payment_mode: "cash", cashier_id: "KIT04", timestamp: "2026-07-11 11:30 AM" },
        { bill_id: "POS-002", payer_type: "staff", staff_id: "KIT01", amount: 100, subsidy_applied: 50, payment_mode: "payroll deduction", cashier_id: "KIT04", timestamp: "2026-07-11 12:15 PM" }
      ];

      state.foodSafetyLogs = {
        fssaiLicense: { license_no: "FSSAI-12345678901234", expiry_date: "2026-09-30", renewal_status: "Active" },
        hygieneAudits: [
          { audit_id: "AUD-F-001", date: "2026-06-15", checklist_result: "Pass (92/100)", next_due_date: "2026-07-15", remarks: "Minor sanitation issue resolved." }
        ],
        haccpTemps: [
          { log_id: "HC-001", storage_unit: "Cold Storage 1", temperature: 3.5, logged_at: "2026-07-11 08:00 AM", breach_flag: false, status: "OK" },
          { log_id: "HC-002", storage_unit: "Cold Storage 2", temperature: 6.2, logged_at: "2026-07-11 10:00 AM", breach_flag: true, status: "Breach", corrective_action: null }
        ],
        otherRecords: {
          pestControl: { lastDate: "2026-06-10", nextDate: "2026-07-10", status: "Done" },
          waterPotability: { lastDate: "2026-05-15", result: "Safe", status: "Done" },
          fireSafety: { lastDate: "2026-04-10", status: "Done" }
        }
      };

      state.consumptionRecords = [
        { record_id: "CON-001", date: "2026-07-10", meal_slot: "Lunch", item_id: "INV-001", expected_qty: 40, actual_issued_qty: 42, variance: 5, reviewed_by: "Ananya R." },
        { record_id: "CON-002", date: "2026-07-10", meal_slot: "Dinner", item_id: "INV-001", expected_qty: 35, actual_issued_qty: 39, variance: 11.4, reviewed_by: null }
      ];

      state.pantryWIPBatches = [
        { batch_id: "WIP-001", item_name: "Marinated Chicken", prepared_by: "Chef Ravi", prepared_at: "2026-07-11 10:00 AM", quantity: 15, unit: "kg", use_by_window: "2026-07-12 10:00 AM", status: "Active", source_movement_id: "IML-003" },
        { batch_id: "WIP-002", item_name: "Chopped Salad base", prepared_by: "Sunita K.", prepared_at: "2026-07-11 08:00 AM", quantity: 10, unit: "kg", use_by_window: "2026-07-11 08:00 PM", status: "Expired", source_movement_id: "IML-004" }
      ];

      state.kitchenFloorStock = [
        { record_id: "KFS-001", item_id: "INV-001", shift: "Morning", date: "2026-07-11", opening_stock: 10, issued_qty: 30, consumed_qty: 35, closing_stock: 5, variance: 0, reviewed_by: "Floor Supervisor Rajesh" }
      ];

      state.kitchenEquipmentAssets = [
        { asset_id: "EQ-001", asset_type: "equipment", name: "Commercial Oven A", location: "Hot Kitchen Floor", install_or_refill_date: "2025-05-10", last_check_date: "2026-05-10", next_check_due: "2026-08-10", status: "Active" },
        { asset_id: "EQ-002", asset_type: "equipment", name: "Dishwasher Unit B", location: "Cleaning Zone", install_or_refill_date: "2025-08-15", last_check_date: "2026-02-15", next_check_due: "2026-05-15", status: "Overdue Maintenance" },
        { asset_id: "EQ-003", asset_type: "lpg_cylinder", name: "LPG Gas Cylinder 1", location: "Gas Bank Room A", install_or_refill_date: "2026-06-01", last_check_date: "2026-06-01", next_check_due: "2026-07-01", status: "Active" },
        { asset_id: "EQ-004", asset_type: "lpg_cylinder", name: "LPG Gas Cylinder 2 (Backup)", location: "Gas Bank Room A", install_or_refill_date: "2026-05-01", last_check_date: "2026-05-01", next_check_due: "2026-06-01", status: "Active (Overdue Safety Check)" }
      ];

      state.kitchenConsumableStock = [
        { item_id: "CON-001", category: "crockery", total_count_or_stock: 150, in_use_or_reorder_level: 120, lost_broken_count: 5, last_audit_date: "2026-07-05" },
        { item_id: "CON-002", category: "cutlery", total_count_or_stock: 300, in_use_or_reorder_level: 250, lost_broken_count: 12, last_audit_date: "2026-07-05" },
        { item_id: "CON-003", category: "trolleys", total_count_or_stock: 15, in_use_or_reorder_level: 12, lost_broken_count: 0, last_audit_date: "2026-07-05" }
      ];

      state.wardPantryStock = [
        { item_id: "INV-002", ward: "GW(M)", current_stock: 10, par_level: 20 },
        { item_id: "INV-002", ward: "GW(F)", current_stock: 15, par_level: 20 }
      ];

      state.mealDeliveryLog = [
        { log_id: "MDL-001", uhid: "SH-2026-04821", ward_bed: "GW(M)-409", meal_slot: "Breakfast", dispatched_by: "Chef Ravi", dispatched_at: "2026-07-11 07:45 AM", delivery_confirmed_by: "Nurse Priya", delivered_at: "2026-07-11 07:55 AM", wastage_qty: 0, wastage_reason: "" }
      ];

      state.pantryDishes = [
        // Patient therapeutic diets
        { dish_id: "DISH-P01", name: "High Protein Veg Thali", segment: "patient", price: { standard: 150, subsidized: 0, free: 0 }, tax_rate: 0, diet_type: "High Protein", allergens: ["dairy", "gluten"], nutritional: { calories: 650, protein: "32g", carbs: "80g", fat: "14g" }, bom: [{ item_id: "INV-001", qty: 100 }, { item_id: "INV-009", qty: 80 }, { item_id: "INV-020", qty: 50 }] },
        { dish_id: "DISH-P02", name: "Low-Sodium Renal Khichdi", segment: "patient", price: { standard: 100, subsidized: 0, free: 0 }, tax_rate: 0, diet_type: "Renal", allergens: ["none"], nutritional: { calories: 350, protein: "12g", carbs: "65g", fat: "4g" }, bom: [{ item_id: "INV-001", qty: 80 }, { item_id: "INV-008", qty: 40 }] },
        { dish_id: "DISH-P03", name: "Diabetic Ragi Porridge", segment: "patient", price: { standard: 90, subsidized: 0, free: 0 }, tax_rate: 0, diet_type: "Diabetic", allergens: ["none"], nutritional: { calories: 280, protein: "8g", carbs: "55g", fat: "3g" }, bom: [{ item_id: "INV-018", qty: 60 }, { item_id: "INV-019", qty: 5 }] },
        { dish_id: "DISH-P04", name: "Soft Clear Liquid Diet", segment: "patient", price: { standard: 70, subsidized: 0, free: 0 }, tax_rate: 0, diet_type: "Liquid", allergens: ["none"], nutritional: { calories: 120, protein: "2g", carbs: "28g", fat: "0g" }, bom: [{ item_id: "INV-013", qty: 10 }] },

        // Cafeteria items - Customer segment
        { dish_id: "DISH-C01", name: "Veg Lunch Thali", segment: "cafeteria_customer", price: { standard: 120, subsidized: 60, free: 0 }, tax_rate: 18, diet_type: "Regular", allergens: ["gluten", "dairy"], nutritional: { calories: 750, protein: "18g", carbs: "110g", fat: "22g" }, bom: [{ item_id: "INV-001", qty: 120 }, { item_id: "INV-005", qty: 80 }] },
        { dish_id: "DISH-C02", name: "Non-Veg Lunch Thali", segment: "cafeteria_customer", price: { standard: 150, subsidized: 80, free: 0 }, tax_rate: 18, diet_type: "Regular", allergens: ["gluten", "egg"], nutritional: { calories: 850, protein: "42g", carbs: "110g", fat: "28g" }, bom: [{ item_id: "INV-001", qty: 120 }, { item_id: "INV-004", qty: 150 }] },
        { dish_id: "DISH-C03", name: "South Indian Breakfast", segment: "cafeteria_customer", price: { standard: 60, subsidized: 30, free: 0 }, tax_rate: 12, diet_type: "Regular", allergens: ["none"], nutritional: { calories: 420, protein: "9g", carbs: "72g", fat: "10g" }, bom: [{ item_id: "INV-001", qty: 60 }] },
        { dish_id: "DISH-C04", name: "Tea / Filter Coffee", segment: "cafeteria_customer", price: { standard: 20, subsidized: 10, free: 0 }, tax_rate: 5, diet_type: "Regular", allergens: ["dairy"], nutritional: { calories: 90, protein: "3g", carbs: "12g", fat: "3g" }, bom: [{ item_id: "INV-002", qty: 150 }] },
        { dish_id: "DISH-C05", name: "Fresh Fruit Juice", segment: "cafeteria_customer", price: { standard: 50, subsidized: 25, free: 0 }, tax_rate: 12, diet_type: "Regular", allergens: ["none"], nutritional: { calories: 150, protein: "1g", carbs: "35g", fat: "0g" }, bom: [] },

        // Cafeteria items - Staff segment
        { dish_id: "DISH-S01", name: "Staff Special Meals", segment: "cafeteria_staff", price: { standard: 100, subsidized: 80, free: 0 }, tax_rate: 18, diet_type: "Regular", allergens: ["gluten", "dairy"], nutritional: { calories: 720, protein: "16g", carbs: "105g", fat: "20g" }, bom: [{ item_id: "INV-001", qty: 100 }, { item_id: "INV-005", qty: 60 }] },
        { dish_id: "DISH-S02", name: "Staff Egg / Veg Sandwich", segment: "cafeteria_staff", price: { standard: 50, subsidized: 40, free: 0 }, tax_rate: 12, diet_type: "Regular", allergens: ["gluten", "egg", "dairy"], nutritional: { calories: 380, protein: "14g", carbs: "42g", fat: "12g" }, bom: [{ item_id: "INV-005", qty: 60 }, { item_id: "INV-010", qty: 1 }] },
        { dish_id: "DISH-S03", name: "Staff Tea / Coffee", segment: "cafeteria_staff", price: { standard: 15, subsidized: 10, free: 0 }, tax_rate: 5, diet_type: "Regular", allergens: ["dairy"], nutritional: { calories: 80, protein: "2.5g", carbs: "10g", fat: "2.5g" }, bom: [{ item_id: "INV-002", qty: 120 }] },
        { dish_id: "DISH-S04", name: "Staff Breakfast Tray", segment: "cafeteria_staff", price: { standard: 60, subsidized: 45, free: 0 }, tax_rate: 12, diet_type: "Regular", allergens: ["gluten", "dairy"], nutritional: { calories: 480, protein: "11g", carbs: "78g", fat: "12g" }, bom: [{ item_id: "INV-001", qty: 60 }] }
      ];

      localStorage.setItem('saronil_outstandingBills', JSON.stringify(state.outstandingBills));
      localStorage.setItem('saronil_followUpLogs', JSON.stringify(state.followUpLogs));
      localStorage.setItem('saronil_writeOffRecords', JSON.stringify(state.writeOffRecords));
      localStorage.setItem('saronil_suspenseReceipts', JSON.stringify(state.suspenseReceipts));
      localStorage.setItem('saronil_matchAttemptLogs', JSON.stringify(state.matchAttemptLogs));
      localStorage.setItem('saronil_bulkAllocations', JSON.stringify(state.bulkAllocations));
      localStorage.setItem('saronil_gstRateConfigs', JSON.stringify(state.gstRateConfigs));
      localStorage.setItem('saronil_gstInvoiceSeries', JSON.stringify(state.gstInvoiceSeries));
      localStorage.setItem('saronil_gstinMaster', JSON.stringify(state.gstinMaster));
      localStorage.setItem('saronil_nonBillingRevenue', JSON.stringify(state.nonBillingRevenue));
      localStorage.setItem('saronil_vendorInvoices', JSON.stringify(state.vendorInvoices));
      localStorage.setItem('saronil_gstNotices', JSON.stringify(state.gstNotices));
      localStorage.setItem('saronil_returnFilings', JSON.stringify(state.returnFilings));
      localStorage.setItem('saronil_complianceCalendar', JSON.stringify(state.complianceCalendar));
      localStorage.setItem('saronil_pantryInventory', JSON.stringify(state.pantryInventory));
      localStorage.setItem('saronil_pantryProcurement', JSON.stringify(state.pantryProcurement));
      localStorage.setItem('saronil_cafeteriaBills', JSON.stringify(state.cafeteriaBills));
      localStorage.setItem('saronil_foodSafetyLogs', JSON.stringify(state.foodSafetyLogs));
      localStorage.setItem('saronil_consumptionRecords', JSON.stringify(state.consumptionRecords));
      localStorage.setItem('saronil_pantryLocations', JSON.stringify(state.pantryLocations));
      localStorage.setItem('saronil_inventoryMovementLog', JSON.stringify(state.inventoryMovementLog));
      localStorage.setItem('saronil_pantryWIPBatches', JSON.stringify(state.pantryWIPBatches));
      localStorage.setItem('saronil_kitchenFloorStock', JSON.stringify(state.kitchenFloorStock));
      localStorage.setItem('saronil_kitchenEquipmentAssets', JSON.stringify(state.kitchenEquipmentAssets));
      localStorage.setItem('saronil_kitchenConsumableStock', JSON.stringify(state.kitchenConsumableStock));
      localStorage.setItem('saronil_wardPantryStock', JSON.stringify(state.wardPantryStock));
      localStorage.setItem('saronil_mealDeliveryLog', JSON.stringify(state.mealDeliveryLog));
      localStorage.setItem('saronil_pantryDishes', JSON.stringify(state.pantryDishes));
    } else {
      state.outstandingBills = JSON.parse(localStorage.getItem('saronil_outstandingBills')) || [];
      state.followUpLogs = JSON.parse(localStorage.getItem('saronil_followUpLogs')) || [];
      state.writeOffRecords = JSON.parse(localStorage.getItem('saronil_writeOffRecords')) || [];
      state.suspenseReceipts = JSON.parse(localStorage.getItem('saronil_suspenseReceipts')) || [];
      state.matchAttemptLogs = JSON.parse(localStorage.getItem('saronil_matchAttemptLogs')) || [];
      state.bulkAllocations = JSON.parse(localStorage.getItem('saronil_bulkAllocations')) || [];
      state.gstRateConfigs = JSON.parse(localStorage.getItem('saronil_gstRateConfigs')) || [];
      state.gstInvoiceSeries = JSON.parse(localStorage.getItem('saronil_gstInvoiceSeries')) || [];
      state.gstinMaster = JSON.parse(localStorage.getItem('saronil_gstinMaster')) || [];
      state.nonBillingRevenue = JSON.parse(localStorage.getItem('saronil_nonBillingRevenue')) || [];
      state.vendorInvoices = JSON.parse(localStorage.getItem('saronil_vendorInvoices')) || [];
      state.gstNotices = JSON.parse(localStorage.getItem('saronil_gstNotices')) || [];
      state.returnFilings = JSON.parse(localStorage.getItem('saronil_returnFilings')) || [];
      state.complianceCalendar = JSON.parse(localStorage.getItem('saronil_complianceCalendar')) || [];
      state.pantryInventory = JSON.parse(localStorage.getItem('saronil_pantryInventory')) || [];
      state.pantryProcurement = JSON.parse(localStorage.getItem('saronil_pantryProcurement')) || null;
      state.cafeteriaBills = JSON.parse(localStorage.getItem('saronil_cafeteriaBills')) || [];
      state.foodSafetyLogs = JSON.parse(localStorage.getItem('saronil_foodSafetyLogs')) || null;
      state.consumptionRecords = JSON.parse(localStorage.getItem('saronil_consumptionRecords')) || [];
      state.pantryLocations = JSON.parse(localStorage.getItem('saronil_pantryLocations')) || [];
      state.inventoryMovementLog = JSON.parse(localStorage.getItem('saronil_inventoryMovementLog')) || [];
      state.pantryWIPBatches = JSON.parse(localStorage.getItem('saronil_pantryWIPBatches')) || [];
      state.kitchenFloorStock = JSON.parse(localStorage.getItem('saronil_kitchenFloorStock')) || [];
      state.kitchenEquipmentAssets = JSON.parse(localStorage.getItem('saronil_kitchenEquipmentAssets')) || [];
      state.kitchenConsumableStock = JSON.parse(localStorage.getItem('saronil_kitchenConsumableStock')) || [];
      state.wardPantryStock = JSON.parse(localStorage.getItem('saronil_wardPantryStock')) || [];
      state.mealDeliveryLog = JSON.parse(localStorage.getItem('saronil_mealDeliveryLog')) || [];
      state.pantryDishes = JSON.parse(localStorage.getItem('saronil_pantryDishes')) || [];
    }
  }

  state.syncOutstandingBills = function() {
    if (!state.outstandingBills) state.outstandingBills = [];
    state.billing.forEach(b => {
      let balance = b.amount - b.paid;
      if (balance > 0) {
        let ext = state.outstandingBills.find(o => o.bill_id === b.id);
        if (!ext) {
          let datePart = new Date(b.date);
          let today = new Date();
          let diffTime = Math.abs(today - datePart);
          let agingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
          
          let reason = "awaiting relative";
          if (b.paymentCategory === 'Insurance') reason = "TPA pending";
          else if (b.paymentCategory === 'CGHS' || b.paymentCategory === 'ECHS') reason = "corporate credit period";
          
          state.outstandingBills.push({
            bill_id: b.id,
            UHID: b.uhid,
            patient_name: b.patientName || "Patient",
            admission_type: b.visitType || 'IPD',
            bill_amount: b.amount,
            amount_received: b.paid,
            balance_due: balance,
            bill_date: b.date,
            payer_type: b.paymentCategory || "Self Pay",
            reason_code: reason,
            aging_days: agingDays,
            status: 'Unpaid',
            assigned_executive: 'Executive Ankit'
          });
        } else {
          ext.bill_amount = b.amount;
          ext.amount_received = b.paid;
          ext.balance_due = balance;
          let datePart = new Date(ext.bill_date);
          let today = new Date();
          let diffTime = Math.abs(today - datePart);
          ext.aging_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
          if (ext.balance_due <= 0) {
            ext.status = 'Closed';
          }
        }
      }
    });
    localStorage.setItem('saronil_outstandingBills', JSON.stringify(state.outstandingBills));
  };
}

// Expose globally
window.seedState = seedState;

// Execute Seeding
seedState();

state.validate = function(action, data) {
  // Find rule configuration to make sure it's active
  const getRule = (id) => state.validationRules.find(r => r.id === id && r.status === 'Active');

  if (action === 'Demographic Entry') {
    // 1. Future DOB validation
    if (data.dob) {
      const birthDate = new Date(data.dob);
      if (birthDate > Date.now()) {
        return { status: 'BLOCK', message: '⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nPatient Date of Birth cannot be in the future.' };
      }
      
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age < 0 || age > 120) {
        return { status: 'BLOCK', message: '⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nCalculated age is invalid (must be between 0 and 120).' };
      }
    }

    // 2. Mobile validation
    if (data.mobile) {
      const mobileClean = data.mobile.replace(/[^0-9]/g, '');
      if (mobileClean.length < 10 || mobileClean.length > 12) {
        return { status: 'BLOCK', message: '⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nInvalid mobile number. Mobile number must contain 10 to 12 digits.' };
      }
    }

    // 3. Email validation
    if (data.email && !data.email.includes('@')) {
      return { status: 'BLOCK', message: '⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nInvalid email address format.' };
    }

    // 4. Duplicate ABHA validation
    if (data.abhaId && data.abhaId !== 'No ABHA Tagged' && data.abhaId !== '') {
      const dupAbha = state.patients.find(p => p.uhid !== data.excludeUhid && p.abhaId && p.abhaId.trim() === data.abhaId.trim());
      if (dupAbha) {
        return { status: 'BLOCK', message: `⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nABHA ID ${data.abhaId} is already linked to patient ${dupAbha.name} (${dupAbha.uhid}).` };
      }
    }

    // 5. Duplicate Aadhaar validation
    if (data.aadhaar && data.aadhaar !== 'Not Provided' && data.aadhaar !== '') {
      const dupAadhaar = state.patients.find(p => p.uhid !== data.excludeUhid && p.aadhaar && p.aadhaar.trim() === data.aadhaar.trim());
      if (dupAadhaar) {
        return { status: 'BLOCK', message: `⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nAadhaar Number ${data.aadhaar} is already linked to patient ${dupAadhaar.name} (${dupAadhaar.uhid}).` };
      }
    }
  }

  if (action === 'Duplicate Entry') {
    const rule = getRule('RULE03');
    if (!rule) return { status: 'PASS' };

    const newNameClean = data.name ? data.name.toLowerCase().trim() : '';
    const mobileClean = data.mobile ? data.mobile.replace(/[^0-9]/g, '') : '';
    const abha = data.abhaId ? data.abhaId.trim() : '';
    const aadhaar = data.aadhaar ? data.aadhaar.trim() : '';
    const passport = data.passport ? data.passport.trim() : '';
    const insuranceId = data.insuranceId ? data.insuranceId.trim() : '';
    const age = data.age;

    const duplicate = state.patients.find(p => {
      const matchMobile = mobileClean && p.mobile && p.mobile.replace(/[^0-9]/g, '').includes(mobileClean);
      const matchAbha = abha && p.abhaId && p.abhaId.replace(/-/g, '') === abha.replace(/-/g, '');
      const matchAadhaar = aadhaar && p.aadhaar && p.aadhaar === aadhaar && aadhaar !== 'Not Provided' && aadhaar !== '';
      const matchPassport = passport && p.passport && p.passport === passport && passport !== 'Not Provided' && passport !== '';
      const matchInsId = insuranceId && p.insuranceId && p.insuranceId === insuranceId && insuranceId !== 'Not Provided' && insuranceId !== '';
      const matchNameAge = newNameClean && p.name.toLowerCase().trim() === newNameClean && p.age === age;
      
      return matchMobile || matchAbha || matchAadhaar || matchPassport || matchInsId || matchNameAge;
    });

    if (duplicate) {
      let score = 30;
      let reasons = [];
      if (mobileClean && duplicate.mobile && duplicate.mobile.replace(/[^0-9]/g, '').includes(mobileClean)) { score += 30; reasons.push("Mobile number matches"); }
      if (abha && duplicate.abhaId && duplicate.abhaId.replace(/-/g, '') === abha.replace(/-/g, '')) { score += 30; reasons.push("ABHA ID matches"); }
      if (aadhaar && duplicate.aadhaar === aadhaar && aadhaar !== 'Not Provided' && aadhaar !== '') { score += 40; reasons.push("Aadhaar Number matches"); }
      if (passport && duplicate.passport === passport && passport !== 'Not Provided' && passport !== '') { score += 40; reasons.push("Passport Number matches"); }
      if (insuranceId && duplicate.insuranceId === insuranceId && insuranceId !== 'Not Provided' && insuranceId !== '') { score += 30; reasons.push("Insurance Policy ID matches"); }
      if (newNameClean && duplicate.name.toLowerCase().trim() === newNameClean && duplicate.age === age) { score += 30; reasons.push("Exact Name & Age match"); }
      score = Math.min(100, score);

      return {
        status: 'WARNING',
        severity: 'Warning',
        ruleId: 'RULE03',
        score: score,
        reasons: reasons,
        existingPatient: duplicate
      };
    }
  }

  if (action === 'Prescription') {
    const allergyRule = getRule('RULE01');
    const interactionRule = getRule('RULE05');
    const patient = state.patients.find(p => p.uhid === data.patientUhid);
    if (!patient) return { status: 'PASS' };

    const drugName = data.drugName;
    const drugClean = drugName.toLowerCase();
    
    // Find the drug object in inventory
    const drugObj = state.inventory.pharmacy.find(item => item.brandName.toLowerCase() === drugClean || item.name.toLowerCase() === drugClean || item.genericName.toLowerCase() === drugClean);

    let safetyAlerts = [];
    let severity = 'Warning'; // Default severity

    // 1. Drug Allergy Check (RULE01)
    if (allergyRule && patient.allergies && patient.allergies !== 'No Known Allergies') {
      const allergiesClean = patient.allergies.toLowerCase();
      
      const isPenicillinAllergic = allergiesClean.includes('penicillin');
      const isPenicillinDrug = drugClean.includes('penicillin') || drugClean.includes('amoxicillin') || drugClean.includes('clavam') || drugClean.includes('ampicillin') || drugClean.includes('piperacillin') || (drugObj && drugObj.genericName.toLowerCase().includes('amoxicillin'));
      
      const isSulfaAllergic = allergiesClean.includes('sulfa');
      const isSulfaDrug = drugClean.includes('sulfa') || drugClean.includes('bactrim') || drugClean.includes('co-trimoxazole');

      if ((isPenicillinAllergic && isPenicillinDrug) || (isSulfaAllergic && isSulfaDrug)) {
        const allergenGroup = isPenicillinAllergic && isPenicillinDrug ? 'Penicillin Group' : 'Sulfa Group';
        safetyAlerts.push({
          type: 'Allergy Alert',
          severity: 'Critical Safety Alert',
          message: `🚨 DRUG-ALLERGY CONFLICT: Patient has documented allergy to ${allergenGroup}. Prescribing ${drugName} is contraindicated.`
        });
        severity = 'Critical Safety Alert';
      }
    }

    // 2. Drug-Drug Interaction Check (RULE05)
    if (interactionRule && patient.prescriptions) {
      const activePrescriptions = patient.prescriptions.map(p => p.drug.toLowerCase());

      const isNewNsaid = drugClean.includes('paracetamol') || drugClean.includes('dolo') || drugClean.includes('crocin') || drugClean.includes('calpol') || drugClean.includes('pacimol') || drugClean.includes('ibuprofen') || drugClean.includes('combiflam') || (drugObj && (drugObj.genericName.toLowerCase().includes('paracetamol') || drugObj.genericName.toLowerCase().includes('ibuprofen')));
      const hasActiveNsaid = activePrescriptions.some(d => d.includes('paracetamol') || d.includes('dolo') || d.includes('crocin') || d.includes('calpol') || d.includes('pacimol') || d.includes('ibuprofen') || d.includes('combiflam'));

      if (isNewNsaid && hasActiveNsaid) {
        safetyAlerts.push({
          type: 'Drug Interaction',
          severity: 'Warning',
          message: `⚠️ THERAPEUTIC DUPLICATION ALERT: Patient is already prescribed an NSAID/Analgesic. Co-prescribing another NSAID increases risk of gastrointestinal issues.`
        });
      }
    }

    // 3. Pregnancy Safety Validation
    if (patient.pregnancyStatus === 'Pregnant' && drugObj) {
      if (drugObj.pregnancyCategory === 'X' || drugObj.pregnancyCategory === 'D') {
        safetyAlerts.push({
          type: 'Pregnancy Alert',
          severity: 'Critical Safety Alert',
          message: `🤰 PREGNANCY WARNING: Prescribing ${drugName} (Category ${drugObj.pregnancyCategory}) is contraindicated during pregnancy.`
        });
        severity = 'Critical Safety Alert';
      } else if (drugObj.pregnancyCategory === 'C') {
        safetyAlerts.push({
          type: 'Pregnancy Alert',
          severity: 'Warning',
          message: `🤰 PREGNANCY CAUTION: ${drugName} is Pregnancy Category C. Prescribe only if potential benefits outweigh clinical risks.`
        });
      }
    }

    // 4. Lactation Safety Validation
    if (patient.pregnancyStatus === 'Lactating' && drugObj) {
      if (drugObj.lactationSafety === 'Contraindicated') {
        safetyAlerts.push({
          type: 'Lactation Alert',
          severity: 'Critical Safety Alert',
          message: `🤱 LACTATION WARNING: ${drugName} is contraindicated during breastfeeding.`
        });
        severity = 'Critical Safety Alert';
      } else if (drugObj.lactationSafety === 'Caution') {
        safetyAlerts.push({
          type: 'Lactation Alert',
          severity: 'Warning',
          message: `🤱 LACTATION CAUTION: Excretion of ${drugName} in breastmilk is possible. Monitor infant for adverse effects.`
        });
      }
    }

    // 5. Renal Function Validation (CKD / eGFR)
    if (patient.egfr && drugObj) {
      if (patient.egfr < 30) {
        if (drugObj.genericName.toLowerCase().includes('metformin')) {
          safetyAlerts.push({
            type: 'Renal Alert',
            severity: 'Hard Stop',
            message: `🛑 RENAL CONTRAINDICATION: Metformin is contraindicated in patients with eGFR < 30 mL/min due to high risk of lactic acidosis.`
          });
          severity = 'Hard Stop';
        } else if (drugObj.genericName.toLowerCase().includes('amoxicillin') || drugObj.brandName.toLowerCase().includes('clavam')) {
          safetyAlerts.push({
            type: 'Renal Alert',
            severity: 'Warning',
            message: `⚠️ RENAL DOSAGE ADJUSTMENT: Patient eGFR is ${patient.egfr} mL/min (Severe Impairment). Reduce Amoxicillin dose to Clavam 375mg QD or Novamox 250mg BID.`
          });
        } else if (drugObj.genericName.toLowerCase().includes('ibuprofen') || drugObj.brandName.toLowerCase().includes('combiflam')) {
          safetyAlerts.push({
            type: 'Renal Alert',
            severity: 'Warning',
            message: `⚠️ RENAL WARNING: NSAID use in eGFR < 30 mL/min is contraindicated due to increased risk of acute kidney injury.`
          });
        }
      } else if (patient.egfr < 45) {
        if (drugObj.genericName.toLowerCase().includes('metformin')) {
          safetyAlerts.push({
            type: 'Renal Alert',
            severity: 'Warning',
            message: `⚠️ RENAL DOSAGE ADJUSTMENT: Patient eGFR is ${patient.egfr} mL/min (Moderate Impairment). Metformin maximum daily dose is 1000mg; monitor closely.`
          });
        }
      }
    }

    // 6. Liver Function Validation
    if (patient.liverFunction === 'Impaired' && drugObj) {
      if (drugObj.liverSafety === 'Contraindicated in liver disease' || drugObj.brandName.toLowerCase().includes('lipvas') || drugObj.brandName.toLowerCase().includes('atorva')) {
        safetyAlerts.push({
          type: 'Hepatic Alert',
          severity: 'Critical Safety Alert',
          message: `🧪 HEPATIC CONTRAINDICATION: Atorvastatin is contraindicated in patients with active liver disease.`
        });
        severity = 'Critical Safety Alert';
      } else if (drugObj.genericName.toLowerCase().includes('paracetamol')) {
        safetyAlerts.push({
          type: 'Hepatic Alert',
          severity: 'Warning',
          message: `⚠️ HEPATIC DOSAGE ADJUSTMENT: Patient has liver impairment. Limit total daily dose of Paracetamol to 2g (max 3 tablets of 650mg/day) to prevent hepatotoxicity.`
        });
      }
    }

    // 7. Age-Based Validation (Pediatric / Geriatric)
    if (patient.age && drugObj) {
      if (patient.age < 12 && drugObj.strength.includes('650mg') && drugObj.genericName.toLowerCase().includes('paracetamol')) {
        safetyAlerts.push({
          type: 'Age Alert',
          severity: 'Warning',
          message: `👶 PEDIATRIC WARNING: 650mg dosage form is not recommended for children under 12 years. Prescribe Crocin Pediatric Drops instead.`
        });
      } else if (patient.age >= 65 && (drugObj.genericName.toLowerCase().includes('ibuprofen') || drugObj.brandName.toLowerCase().includes('combiflam'))) {
        safetyAlerts.push({
          type: 'Age Alert',
          severity: 'Warning',
          message: `👴 GERIATRIC WARNING: NSAID use in patients over 65 increases risk of GI bleeding, cardiovascular events, and renal impairment.`
        });
      }
    }

    if (safetyAlerts.length > 0) {
      return {
        status: 'WARNING',
        severity: severity,
        ruleId: 'RULE01_05',
        alerts: safetyAlerts,
        message: safetyAlerts.map(a => a.message).join('\n')
      };
    }
  }

  if (action === 'Transfusion Issue') {
    const rule = getRule('RULE02');
    if (!rule) return { status: 'PASS' };

    const patient = state.patients.find(p => p.uhid === data.patientUhid);
    if (!patient) return { status: 'PASS' };

    const patientBlood = patient.bloodGroup.trim();
    const donorBlood = data.bloodGroupRequired.trim();

    let isCompatible = false;
    if (patientBlood === 'AB+') {
      isCompatible = true;
    } else if (patientBlood === 'AB-') {
      isCompatible = ['O-', 'A-', 'B-', 'AB-'].includes(donorBlood);
    } else if (patientBlood === 'A+') {
      isCompatible = ['O-', 'O+', 'A-', 'A+'].includes(donorBlood);
    } else if (patientBlood === 'A-') {
      isCompatible = ['O-', 'A-'].includes(donorBlood);
    } else if (patientBlood === 'B+') {
      isCompatible = ['O-', 'O+', 'B-', 'B+'].includes(donorBlood);
    } else if (patientBlood === 'B-') {
      isCompatible = ['O-', 'B-'].includes(donorBlood);
    } else if (patientBlood === 'O+') {
      isCompatible = ['O-', 'O+'].includes(donorBlood);
    } else if (patientBlood === 'O-') {
      isCompatible = donorBlood === 'O-';
    }

    if (!isCompatible) {
      return {
        status: 'BLOCK',
        severity: 'Hard Stop',
        ruleId: 'RULE02',
        message: `🛑 HARD STOP: ABO INCOMPATIBILITY DETECTED!\nPatient Blood Group is ${patientBlood}, but requested transfusion blood group is ${donorBlood}. Transfusion blocked immediately to prevent acute hemolytic reaction.`
      };
    }
  }

  if (action === 'Vitals Entry') {
    const rule = getRule('RULE04');
    if (!rule) return { status: 'PASS' };

    const bp = data.vitals.bp;
    const hr = parseInt(data.vitals.hr);
    const temp = parseFloat(data.vitals.temp);
    const spo2 = parseInt(data.vitals.spo2);

    let newsScore = 0;
    let reasons = [];

    // HR NEWS2 Score
    if (hr <= 40 || hr >= 131) {
      newsScore += 3;
      reasons.push(`Critical Heart Rate: ${hr} bpm`);
    } else if (hr >= 111 && hr <= 130) {
      newsScore += 2;
      reasons.push(`Elevated Heart Rate: ${hr} bpm`);
    } else if ((hr >= 41 && hr <= 50) || (hr >= 91 && hr <= 110)) {
      newsScore += 1;
      reasons.push(`Mild Heart Rate variation: ${hr} bpm`);
    }

    // SpO2 NEWS2 Score
    if (spo2 <= 91) {
      newsScore += 3;
      reasons.push(`Critical Oxygen Saturation: ${spo2}%`);
    } else if (spo2 >= 92 && spo2 <= 93) {
      newsScore += 2;
      reasons.push(`Low Oxygen Saturation: ${spo2}%`);
    } else if (spo2 >= 94 && spo2 <= 95) {
      newsScore += 1;
      reasons.push(`Mild Oxygen Saturation drop: ${spo2}%`);
    }

    // Temp NEWS2 Score
    if (temp <= 95.0 || temp >= 102.3) {
      newsScore += 3;
      reasons.push(`Critical Body Temperature: ${temp}°F`);
    } else if ((temp >= 95.1 && temp <= 96.8) || (temp >= 100.5 && temp <= 102.2)) {
      newsScore += 1;
      reasons.push(`Fever/Hypothermia: ${temp}°F`);
    }

    // Systolic BP NEWS2 Score
    const systolic = parseInt(bp.split('/')[0]);
    if (systolic) {
      if (systolic <= 90 || systolic >= 220) {
        newsScore += 3;
        reasons.push(`Critical Systolic Blood Pressure: ${systolic} mmHg`);
      } else if (systolic >= 91 && systolic <= 100) {
        newsScore += 2;
        reasons.push(`Low Systolic Blood Pressure: ${systolic} mmHg`);
      } else if (systolic >= 101 && systolic <= 110) {
        newsScore += 1;
        reasons.push(`Mild Systolic Blood Pressure drop: ${systolic} mmHg`);
      }
    }

    if (newsScore >= 5 || reasons.some(r => r.includes('Critical'))) {
      return {
        status: 'WARNING',
        severity: 'Critical Safety Alert',
        ruleId: 'RULE04',
        score: newsScore,
        reasons: reasons,
        message: `🚨 CRITICAL SAFETY ALERT: SEPSIS RISK (NEWS2 Score: ${newsScore})\nPatient exhibits physiological instability: ${reasons.join(', ')}. Immediately notify medical registrar.`
      };
    }
  }

  if (action === 'Dispensing') {
    const rule = getRule('RULE05');
    if (!rule) return { status: 'PASS' };

    const patient = state.patients.find(p => p.uhid === data.patientUhid);
    if (!patient || !patient.prescriptions) return { status: 'PASS' };

    const activeDrugs = patient.prescriptions.map(p => p.drug.toLowerCase());
    
    let nsaidCount = 0;
    activeDrugs.forEach(d => {
      if (d.includes('paracetamol') || d.includes('dolo') || d.includes('ibuprofen') || d.includes('combiflam')) {
        nsaidCount++;
      }
    });

    if (nsaidCount > 1) {
      return {
        status: 'WARNING',
        severity: 'Warning',
        ruleId: 'RULE05',
        message: `⚠️ JCI PHARMACY DISPENSING WARNING:\nTherapeutic Duplication detected. Prescription contains multiple NSAIDs/Analgesics which may cause adverse renal/GI issues.`
      };
    }
  }

  if (action === 'Bed Status Update') {
    const rule = getRule('RULE07');
    if (rule) {
      const bedId = data.bedId;
      const newStatus = data.newStatus;
      const currentBed = state.bedsStatus[bedId];

      if (currentBed) {
        // Invalid Action 1: Occupied -> Housekeeping
        if (currentBed.status === 'Occupied' && (newStatus === 'Vacated - Pending Housekeeping' || newStatus === 'Housekeeping In Progress' || newStatus === 'House Keeping')) {
          return {
            status: 'BLOCK',
            severity: 'Hard Stop',
            ruleId: 'RULE07',
            message: '⚠️ Bed is currently occupied by an active patient. Complete discharge or transfer before initiating housekeeping.'
          };
        }

        // Invalid Action 2: Occupied -> Available
        if (currentBed.status === 'Occupied' && (newStatus === 'Available' || newStatus === 'Vacant')) {
          return {
            status: 'BLOCK',
            severity: 'Hard Stop',
            ruleId: 'RULE07',
            message: '⚠️ An occupied bed cannot be marked available.'
          };
        }

        // Invalid Action 3: Vacated Pending Housekeeping -> Occupied
        if (currentBed.status === 'Vacated - Pending Housekeeping' && newStatus === 'Occupied') {
          return {
            status: 'BLOCK',
            severity: 'Hard Stop',
            ruleId: 'RULE07',
            message: '⚠️ Bed cleaning must be completed before reassignment.'
          };
        }

        // Invalid Action 4: Housekeeping In Progress -> Occupied
        if (currentBed.status === 'Housekeeping In Progress' && newStatus === 'Occupied') {
          return {
            status: 'BLOCK',
            severity: 'Hard Stop',
            ruleId: 'RULE07',
            message: '⚠️ Bed is currently under cleaning and cannot be assigned.'
          };
        }

        // Invalid Action 5: Maintenance Required -> Occupied
        if (currentBed.status === 'Maintenance Required' && newStatus === 'Occupied') {
          return {
            status: 'BLOCK',
            severity: 'Hard Stop',
            ruleId: 'RULE07',
            message: '⚠️ Bed is under maintenance and unavailable for patient assignment.'
          };
        }
      }
    }
  }

  return { status: 'PASS' };
};

window.setupPatientAutocomplete = function({
  searchInputId,
  hiddenInputId,
  autocompleteListId,
  filterFn,
  onSelect
}) {
  const searchInput = document.getElementById(searchInputId);
  const hiddenInput = document.getElementById(hiddenInputId);
  const autocompleteList = document.getElementById(autocompleteListId);

  if (!searchInput || !hiddenInput || !autocompleteList) return;

  const showDropdown = () => {
    const query = searchInput.value.toLowerCase().trim();
    let matched = state.patients;
    if (filterFn) {
      matched = matched.filter(filterFn);
    }

    if (query) {
      matched = matched.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.mobile.includes(query) ||
        p.uhid.toLowerCase().includes(query)
      );
    }

    if (matched.length === 0) {
      autocompleteList.innerHTML = `<div class="autocomplete-group-title">No matching patients found</div>`;
      autocompleteList.style.display = 'block';
      return;
    }

    autocompleteList.innerHTML = `
      <div class="autocomplete-group-title">Patients (${matched.length})</div>
      ${matched.map(p => `
        <div class="autocomplete-item" data-uhid="${p.uhid}" data-name="${p.name}">
          <div class="autocomplete-item-row">
            <span class="autocomplete-brand-name">${p.name}</span>
            <span class="badge" style="font-size: 0.75rem; background-color: var(--primary-glow); color: var(--primary); padding: 2px 6px; border-radius: 4px;">${p.uhid}</span>
          </div>
          <div class="autocomplete-meta-line" style="display: flex; justify-content: space-between; gap: 1rem; align-items: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
            <span>📱 ${p.mobile} | Age: ${p.age} | ${p.gender}</span>
            <span style="font-weight: 600; color: ${p.status === 'Admitted' ? 'var(--color-success)' : 'var(--text-muted)'};">${p.status}</span>
          </div>
        </div>
      `).join('')}
    `;

    autocompleteList.style.display = 'block';

    const items = autocompleteList.querySelectorAll('.autocomplete-item');
    items.forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      item.addEventListener('click', () => {
        const uhid = item.getAttribute('data-uhid');
        const name = item.getAttribute('data-name');
        
        searchInput.value = `${name} (${uhid})`;
        hiddenInput.value = uhid;
        autocompleteList.style.display = 'none';

        hiddenInput.dispatchEvent(new Event('change'));

        if (onSelect) {
          onSelect(uhid, name);
        }
      });
    });
  };

  searchInput.addEventListener('focus', () => {
    showDropdown();
  });

  searchInput.addEventListener('input', showDropdown);

  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      autocompleteList.style.display = 'none';
      
      const selectedUhid = hiddenInput.value;
      const patient = state.patients.find(p => p.uhid === selectedUhid);
      if (patient) {
        searchInput.value = `${patient.name} (${patient.uhid})`;
      } else {
        searchInput.value = '';
        hiddenInput.value = '';
        hiddenInput.dispatchEvent(new Event('change'));
      }
    }, 200);
  });
};

state.logBedMovement = function({
  patientId = null,
  encounterId = null,
  bedId,
  wardKey,
  prevStatus,
  newStatus,
  action,
  user = 'Dr. Amit Verma',
  role = 'System Admin',
  reason = '',
  remarks = ''
}) {
  state.bedAuditLogs = state.bedAuditLogs || [];
  state.bedAuditLogs.push({
    timestamp: new Date().toISOString(),
    patientId,
    encounterId,
    bedId,
    wardKey,
    prevStatus,
    newStatus,
    action,
    user,
    role,
    reason,
    remarks
  });
  localStorage.setItem('saronil_bedAuditLogs', JSON.stringify(state.bedAuditLogs));
};

state.triggerHousekeepingRequest = function(bedId, wardKey, notes) {
  if (!bedId || !wardKey) return;
  state.housekeepingTasks = state.housekeepingTasks || [];
  
  // Check if there is an active (non-Completed, non-Verified) task for this bed
  const exists = state.housekeepingTasks.some(t => t.bedId === bedId && t.status !== 'Completed' && t.status !== 'Verified');
  if (exists) return;

  const taskId = 'HK-' + String(1000 + state.housekeepingTasks.length + 1);
  const newTask = {
    id: taskId,
    taskId: taskId,
    type: "Discharge Cleaning",
    source: "IPD",
    bedId: bedId,
    wardKey: wardKey,
    priority: (bedId.startsWith('EMG') || bedId.startsWith('CCU') || bedId.startsWith('ICCU')) ? 'High' : 'Normal',
    status: 'New',
    createdTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    assignee: null,
    assignedTime: null,
    completedTime: null,
    verifiedTime: null,
    icNurseSigned: false,
    icNurseName: null,
    checklist: {
      "Floor mopped with disinfectant": false,
      "Surfaces wiped": false,
      "Bin emptied and relined": false,
      "Linen changed": false,
      "Bathroom cleaned": false,
      "Equipment wiped": false
    },
    remarks: notes || 'Awaiting cleaning request',
    audit: [{ timestamp: new Date().toISOString(), user: 'ATD System', role: 'System', action: 'CREATE', remarks: notes || 'Awaiting clean request' }]
  };

  state.housekeepingTasks.push(newTask);
  localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(state.housekeepingTasks));

  // Sync state.hkAuditLogs
  state.hkAuditLogs = state.hkAuditLogs || [];
  state.hkAuditLogs.unshift({
    timestamp: new Date().toISOString(),
    user: 'ATD System',
    role: 'System',
    action: 'AUTO_CREATE',
    taskId: taskId,
    roomBed: bedId,
    remarks: notes || 'Cleaning request automatically assigned.'
  });
  localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(state.hkAuditLogs));
};

state.completeHousekeepingTasks = function(bedId) {
  if (!bedId) return;
  state.housekeepingTasks = state.housekeepingTasks || [];
  let updated = false;
  state.housekeepingTasks.forEach(t => {
    if (t.bedId === bedId && t.status !== 'Completed' && t.status !== 'Verified') {
      t.status = 'Verified';
      t.completedTime = new Date().toISOString();
      t.verifiedTime = new Date().toISOString();
      t.audit.push({ timestamp: new Date().toISOString(), user: 'ATD System', role: 'System', action: 'VERIFY', remarks: 'Bed marked ready/available in Bed Board.' });
      
      state.hkAuditLogs = state.hkAuditLogs || [];
      state.hkAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        user: 'ATD System',
        role: 'System',
        action: 'VERIFY',
        taskId: t.id,
        roomBed: bedId,
        remarks: 'Cleaning verified and bed marked available.'
      });
      updated = true;
    }
  });
  if (updated) {
    localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(state.housekeepingTasks));
    localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(state.hkAuditLogs));
  }
};
  // Initialize Daycare collections
  state.daycareBookings = [];
  state.daycareAuditLogs = [];
  state.unplannedReturns = [];
  
  // Insurer Daycare cashless eligible procedure lists
  state.daycarePayerProcedureLists = {
    "Star Health": ["Cataract Surgery", "Chemotherapy Infusion", "Biopsy Sample Collection", "Dialysis Treatment"],
    "HDFC ERGO": ["Chemotherapy Infusion", "Endoscopy Scope Evaluation", "Laparoscopic Appendectomy", "Hernia Repair"],
    "ICICI Lombard": ["Cataract Surgery", "Minor Debridement & Dressing", "Biopsy Sample Collection", "Laparoscopic Cholecystectomy"]
  };

  // Seed the 3 custom daycare admissions with specific elapsed times
  state.daycareAdmissions = [];
  
  // Setup 3 patients for daycare
  const dcPatients = [
    state.patients.find(p => p.uhid === "SH-2026-04822") || state.patients[0],
    state.patients.find(p => p.uhid === "SH-2026-04812") || state.patients[1],
    state.patients.find(p => p.uhid === "SH-2026-04801") || state.patients[2]
  ];

  // Admission timestamps to get exact elapsed stay clocks
  const nowMs = Date.now();
  const timeA = new Date(nowMs - 2 * 60 * 60 * 1000).toISOString(); // 2 hours stay
  const timeB = new Date(nowMs - (10 * 60 + 15) * 60 * 1000).toISOString(); // 10h 15m stay
  const timeC = new Date(nowMs - (12 * 60 + 15) * 60 * 1000).toISOString(); // 12h 15m stay (breached)

  state.daycareAdmissions.push({
    admissionId: "DC-ADM-4822",
    uhid: dcPatients[0].uhid,
    patient: dcPatients[0],
    bedId: "DC-B1",
    ward: "DAYCARE",
    bedNo: "DC-B1",
    consultantName: "Dr. Amit Verma",
    procedureName: "Chemotherapy Infusion",
    admissionType: "Daycare",
    admissionTimestamp: timeA,
    status: "Booked",
    payerType: "TPA Cashless",
    tpaName: "Star Health",
    preauthStatus: "Approved",
    preauthAmount: 8000,
    sedationRequired: "No",
    npoRequiredHours: 0,
    abha_id: "14-8002-9876-1234",
    abha_consent_captured: true,
    consents: [{ consent_id: "CON-4822-01", admission_id: "DC-ADM-4822", type: "procedure", signed_by: "Reception Desk", timestamp: timeA }],
    vitalsLogs: [],
    medicationLogs: [],
    labRequests: [],
    pharmacyOrders: [
      { orderId: "PO-4822-01", drugName: "Inj. Ondansetron 4mg", dose: "4mg", route: "IV", frequency: "STAT", quantity: 2, status: "Pending", requestedBy: "Daycare Nurse", requestedAt: new Date(nowMs - 1.5 * 3600000).toISOString() }
    ],
    dischargeSummary: { instructions: '', prescription: '', doctorName: '', followUpDate: '' },
    advanceCollected: 0,
    isBilled: false,
    isEscalated: false,
    adverseEventLogs: [],
    escalationLogs: [],
    consumablesLogs: [],
    siteChecks: [],
    historyLogs: [{ timestamp: timeA, action: "Daycare Slot Booked" }, { timestamp: timeA, action: "Consent Captured (Procedure)" }, { timestamp: timeA, action: "ABHA ID linked with patient consent" }]
  });

  state.daycareAdmissions.push({
    admissionId: "DC-ADM-4812",
    uhid: dcPatients[1].uhid,
    patient: dcPatients[1],
    bedId: "DC-B2",
    ward: "DAYCARE",
    bedNo: "DC-B2",
    consultantName: "Dr. Priya Nair",
    procedureName: "Cataract Surgery",
    admissionType: "Daycare",
    admissionTimestamp: timeB,
    status: "Under Treatment",
    payerType: "TPA Cashless",
    tpaName: "HDFC ERGO",
    preauthStatus: "Approved",
    preauthAmount: 15000,
    sedationRequired: "Yes",
    npoRequiredHours: 6,
    abha_id: null,
    abha_consent_captured: false,
    consents: [
      { consent_id: "CON-4812-01", admission_id: "DC-ADM-4812", type: "procedure", signed_by: "Reception Desk", timestamp: timeB },
      { consent_id: "CON-4812-02", admission_id: "DC-ADM-4812", type: "anesthesia", signed_by: "Reception Desk", timestamp: timeB }
    ],
    vitalsLogs: [
      { timestamp: new Date(nowMs - 9.5 * 3600000).toISOString(), BP: "125/82", pulse: 75, SpO2: 98, temp: "98.6", RespRate: 16, checkedBy: "Staff Nurse Bindu" },
      { timestamp: new Date(nowMs - 9 * 3600000).toISOString(), BP: "123/80", pulse: 74, SpO2: 98, temp: "98.5", RespRate: 16, checkedBy: "Staff Nurse Bindu" },
      { timestamp: new Date(nowMs - 8.5 * 3600000).toISOString(), BP: "122/80", pulse: 73, SpO2: 99, temp: "98.4", RespRate: 16, checkedBy: "Staff Nurse Bindu" },
      { timestamp: new Date(nowMs - 8 * 3600000).toISOString(), BP: "121/78", pulse: 72, SpO2: 98, temp: "98.4", RespRate: 15, checkedBy: "Staff Nurse Bindu" }
    ],
    medicationLogs: [],
    labRequests: [],
    pharmacyOrders: [
      { orderId: "PO-4812-01", drugName: "Inj. Midazolam 2mg", dose: "2mg", route: "IV", frequency: "STAT", quantity: 1, status: "Dispensed", batchNo: "BT-88211", expiry: "2026-12", unitCost: 85, dispensedBy: "Pharmacist", requestedBy: "Daycare Nurse", requestedAt: new Date(nowMs - 9 * 3600000).toISOString(), dispensedAt: new Date(nowMs - 8.8 * 3600000).toISOString() },
      { orderId: "PO-4812-02", drugName: "Inj. Ondansetron 4mg", dose: "4mg", route: "IV", frequency: "OD", quantity: 2, status: "Dispensed", batchNo: "BT-77490", expiry: "2027-03", unitCost: 42, dispensedBy: "Pharmacist", requestedBy: "Daycare Nurse", requestedAt: new Date(nowMs - 8.5 * 3600000).toISOString(), dispensedAt: new Date(nowMs - 8.2 * 3600000).toISOString() }
    ],
    dischargeSummary: { instructions: '', prescription: '', doctorName: '', followUpDate: '' },
    advanceCollected: 0,
    isBilled: false,
    isEscalated: false,
    ordersSigned: true,
    preTreatmentChecklist: {
      admissionId: "DC-ADM-4812",
      identity_confirmed: true,
      npo_status: true,
      consent_verified: true,
      allergy_check_result: true,
      baseline_vitals_ref: { BP: '124/80', pulse: 74, SpO2: 98, temp: '98.6', RespRate: 16 },
      checked_by: 'Staff Nurse Bindu',
      timestamp: timeB
    },
    treatmentSession: {
      session_id: 'TS-DC-ADM-4812',
      admission_id: 'DC-ADM-4812',
      treatment_start_timestamp: timeB,
      treatment_type: 'Cataract Surgery',
      ordered_by: 'Dr. Priya Nair',
      initiated_by: 'Staff Nurse Bindu'
    },
    adverseEventLogs: [],
    escalationLogs: [],
    consumablesLogs: [
      { item: 'IV Cannula 20G', qty: 1, loggedBy: 'Staff Nurse Bindu', timestamp: new Date(nowMs - 9 * 3600000).toISOString() },
      { item: 'Normal Saline 500ml', qty: 1, loggedBy: 'Staff Nurse Bindu', timestamp: new Date(nowMs - 9 * 3600000).toISOString() }
    ],
    siteChecks: [],
    historyLogs: [
      { timestamp: timeB, action: "Daycare Slot Booked" },
      { timestamp: timeB, action: "Pre-Treatment Verification Checked" },
      { timestamp: timeB, action: "Treatment Initiated" }
    ]
  });

  state.daycareAdmissions.push({
    admissionId: "DC-ADM-4801",
    uhid: dcPatients[2].uhid,
    patient: dcPatients[2],
    bedId: "DC-B3",
    ward: "DAYCARE",
    bedNo: "DC-B3",
    consultantName: "Dr. Srinivasan",
    procedureName: "Laparoscopic Hernia Repair",
    admissionType: "Daycare",
    admissionTimestamp: timeC,
    status: "Observation",
    payerType: "Cash",
    tpaName: "Self Pay",
    preauthStatus: null,
    preauthAmount: 0,
    sedationRequired: "Yes",
    npoRequiredHours: 8,
    abha_id: null,
    abha_consent_captured: false,
    consents: [
      { consent_id: "CON-4801-01", admission_id: "DC-ADM-4801", type: "procedure", signed_by: "Reception Desk", timestamp: timeC },
      { consent_id: "CON-4801-02", admission_id: "DC-ADM-4801", type: "anesthesia", signed_by: "Reception Desk", timestamp: timeC }
    ],
    vitalsLogs: [
      { timestamp: new Date(nowMs - 11.5 * 3600000).toISOString(), BP: "128/84", pulse: 76, SpO2: 97, temp: "98.7", RespRate: 18, checkedBy: "Sister In-charge Latha" },
      { timestamp: new Date(nowMs - 11 * 3600000).toISOString(), BP: "126/82", pulse: 75, SpO2: 98, temp: "98.6", RespRate: 17, checkedBy: "Sister In-charge Latha" },
      { timestamp: new Date(nowMs - 10.5 * 3600000).toISOString(), BP: "125/80", pulse: 74, SpO2: 98, temp: "98.6", RespRate: 16, checkedBy: "Sister In-charge Latha" },
      { timestamp: new Date(nowMs - 10 * 3600000).toISOString(), BP: "124/80", pulse: 73, SpO2: 98, temp: "98.4", RespRate: 16, checkedBy: "Sister In-charge Latha" }
    ],
    medicationLogs: [],
    labRequests: [],
    pharmacyOrders: [
      { orderId: "PO-4801-01", drugName: "Inj. Tramadol 50mg", dose: "50mg", route: "IM", frequency: "SOS", quantity: 2, status: "Dispensed", batchNo: "BT-55821", expiry: "2026-11", unitCost: 38, dispensedBy: "Pharmacist", requestedBy: "Daycare Nurse", requestedAt: new Date(nowMs - 8 * 3600000).toISOString(), dispensedAt: new Date(nowMs - 7.8 * 3600000).toISOString() },
      { orderId: "PO-4801-02", drugName: "Tab. Paracetamol 500mg", dose: "500mg", route: "Oral", frequency: "TDS", quantity: 6, status: "Dispensed", batchNo: "BT-33011", expiry: "2027-06", unitCost: 5, dispensedBy: "Pharmacist", requestedBy: "Daycare Nurse", requestedAt: new Date(nowMs - 4 * 3600000).toISOString(), dispensedAt: new Date(nowMs - 3.8 * 3600000).toISOString() }
    ],
    dischargeSummary: { instructions: '', prescription: '', doctorName: '', followUpDate: '' },
    advanceCollected: 5000,
    isBilled: false,
    isEscalated: false,
    ordersSigned: true,
    preTreatmentChecklist: {
      admissionId: "DC-ADM-4801",
      identity_confirmed: true,
      npo_status: true,
      consent_verified: true,
      allergy_check_result: true,
      baseline_vitals_ref: { BP: '130/85', pulse: 78, SpO2: 97, temp: '98.8', RespRate: 18 },
      checked_by: 'Sister In-charge Latha',
      timestamp: timeC
    },
    treatmentSession: {
      session_id: 'TS-DC-ADM-4801',
      admission_id: 'DC-ADM-4801',
      treatment_start_timestamp: timeC,
      treatment_type: 'Laparoscopic Hernia Repair',
      ordered_by: 'Dr. Srinivasan',
      initiated_by: 'Sister In-charge Latha'
    },
    endOfTreatmentAssessment: {
      activity: 2,
      respiration: 2,
      circulation: 2,
      consciousness: 2,
      o2_saturation: 2,
      total_score: 10,
      recovery_signs_confirmed: true,
      assessed_by: "Sister In-charge Latha",
      timestamp: new Date(nowMs - 2 * 3600000).toISOString()
    },
    adverseEventLogs: [],
    escalationLogs: [],
    consumablesLogs: [
      { item: 'IV Cannula 18G', qty: 1, loggedBy: 'Sister In-charge Latha', timestamp: timeC },
      { item: 'Ringer Lactate 500ml', qty: 2, loggedBy: 'Sister In-charge Latha', timestamp: timeC },
      { item: 'Surgical Drape Pack', qty: 1, loggedBy: 'Sister In-charge Latha', timestamp: timeC }
    ],
    siteChecks: [],
    historyLogs: [
      { timestamp: timeC, action: "Daycare Slot Booked" },
      { timestamp: timeC, action: "Pre-Treatment Verification Checked" },
      { timestamp: timeC, action: "Treatment Initiated" },
      { timestamp: new Date(nowMs - 2 * 3600000).toISOString(), action: "End-of-Treatment Assessment Logged" }
    ]
  });

  // 4th admission: DC-B4 — Ready for Discharge — CGHS Scheme — Invoice settled pending claim
  const timeD = new Date(nowMs - 9 * 60 * 60 * 1000).toISOString(); // 9hr stay
  const dcPatient4 = state.patients.find(p => p.uhid === "SH-2026-03801") || { uhid: "SH-2026-03801", name: "Rajeev Shankar", age: 58, gender: "Male", mobile: "9876500321", address: "B-14, Defence Colony, Delhi", nokName: "Sunita Shankar", nokMobile: "9876500322", allergies: [], type: "Daycare" };
  if (!state.patients.find(p => p.uhid === "SH-2026-03801")) state.patients.push(dcPatient4);

  state.daycareAdmissions.push({
    admissionId: "DC-ADM-4790",
    uhid: dcPatient4.uhid,
    patient: dcPatient4,
    bedId: "DC-B4",
    ward: "DAYCARE",
    bedNo: "DC-B4",
    consultantName: "Dr. Mohan Reddy",
    procedureName: "Endoscopy Scope Evaluation",
    admissionType: "Daycare",
    admissionTimestamp: timeD,
    status: "Ready for Discharge",
    payerType: "TPA Cashless",
    tpaName: "CGHS",
    preauthStatus: "Approved",
    preauthAmount: 4500,
    sedationRequired: "Yes",
    npoRequiredHours: 6,
    abha_id: "23-5501-8822-9910",
    abha_consent_captured: true,
    consents: [
      { consent_id: "CON-4790-01", admission_id: "DC-ADM-4790", type: "procedure", signed_by: "Reception Desk", timestamp: timeD },
      { consent_id: "CON-4790-02", admission_id: "DC-ADM-4790", type: "anesthesia", signed_by: "Reception Desk", timestamp: timeD }
    ],
    vitalsLogs: [
      { timestamp: new Date(nowMs - 8.5 * 3600000).toISOString(), BP: "130/86", pulse: 78, SpO2: 96, temp: "98.8", RespRate: 18, checkedBy: "Staff Nurse Rekha" },
      { timestamp: new Date(nowMs - 8 * 3600000).toISOString(), BP: "128/84", pulse: 76, SpO2: 97, temp: "98.6", RespRate: 17, checkedBy: "Staff Nurse Rekha" },
      { timestamp: new Date(nowMs - 4 * 3600000).toISOString(), BP: "126/82", pulse: 74, SpO2: 98, temp: "98.4", RespRate: 16, checkedBy: "Staff Nurse Rekha" }
    ],
    medicationLogs: [],
    labRequests: [
      { testName: "Pre-procedure CBC", status: "Completed", result: "Hb 12.4 g/dL, WBC 7800/mm³ — Normal", timestamp: new Date(nowMs - 9 * 3600000).toISOString() }
    ],
    pharmacyOrders: [
      { orderId: "PO-4790-01", drugName: "Inj. Midazolam 2mg", dose: "2mg", route: "IV", frequency: "STAT", quantity: 1, status: "Dispensed", batchNo: "BT-21099", expiry: "2026-10", unitCost: 85, dispensedBy: "Pharmacist", requestedBy: "Daycare Nurse", requestedAt: new Date(nowMs - 8.8 * 3600000).toISOString(), dispensedAt: new Date(nowMs - 8.5 * 3600000).toISOString() },
      { orderId: "PO-4790-02", drugName: "Inj. Propofol 200mg", dose: "200mg", route: "IV", frequency: "STAT", quantity: 1, status: "Dispensed", batchNo: "BT-19982", expiry: "2026-12", unitCost: 320, dispensedBy: "Pharmacist", requestedBy: "Daycare Nurse", requestedAt: new Date(nowMs - 8.7 * 3600000).toISOString(), dispensedAt: new Date(nowMs - 8.4 * 3600000).toISOString() }
    ],
    consumablesLogs: [
      { item: 'IV Cannula 20G', qty: 1, loggedBy: 'Staff Nurse Rekha', timestamp: timeD },
      { item: 'Endoscopy Scope Cover', qty: 1, loggedBy: 'Staff Nurse Rekha', timestamp: timeD }
    ],
    dischargeSummary: { instructions: 'Soft diet for 48 hours. Avoid NSAIDs. Follow up in 7 days.', prescription: 'Tab. Pantoprazole 40mg OD x 14 days', doctorName: 'Dr. Mohan Reddy', followUpDate: new Date(nowMs + 7 * 24 * 3600000).toISOString().split('T')[0] },
    advanceCollected: 2000,
    isBilled: true,
    invoiceSummary: { grossTotal: 4930, nonTaxableAmount: 4500, taxableAmount: 502, gstAmount: 77, netPayable: 0, settledAt: new Date(nowMs - 1 * 3600000).toISOString() },
    isEscalated: false,
    ordersSigned: true,
    preTreatmentChecklist: {
      admissionId: "DC-ADM-4790",
      identity_confirmed: true,
      npo_status: true,
      consent_verified: true,
      allergy_check_result: true,
      baseline_vitals_ref: { BP: '132/86', pulse: 80, SpO2: 96, temp: '98.8', RespRate: 18 },
      checked_by: 'Staff Nurse Rekha',
      timestamp: timeD
    },
    treatmentSession: {
      session_id: 'TS-DC-ADM-4790',
      admission_id: 'DC-ADM-4790',
      treatment_start_timestamp: timeD,
      treatment_type: 'Endoscopy Scope Evaluation',
      ordered_by: 'Dr. Mohan Reddy',
      initiated_by: 'Staff Nurse Rekha'
    },
    endOfTreatmentAssessment: {
      activity: 2, respiration: 2, circulation: 2, consciousness: 2, o2_saturation: 2, total_score: 10,
      recovery_signs_confirmed: true,
      assessed_by: "Staff Nurse Rekha",
      doctor_review_notes: "Patient fully recovered. No complications. Fit for discharge.",
      timestamp: new Date(nowMs - 1.5 * 3600000).toISOString()
    },
    adverseEventLogs: [],
    escalationLogs: [],
    siteChecks: [],
    historyLogs: [
      { timestamp: timeD, action: "Daycare Slot Booked" },
      { timestamp: timeD, action: "ABHA ID 23-5501-8822-9910 linked (Consent captured)" },
      { timestamp: timeD, action: "Pre-Treatment Verification Checked" },
      { timestamp: timeD, action: "Treatment Initiated" },
      { timestamp: new Date(nowMs - 2 * 3600000).toISOString(), action: "End-of-Treatment Assessment Logged (Aldrete 10/10)" },
      { timestamp: new Date(nowMs - 1.5 * 3600000).toISOString(), action: "Doctor Final Discharge Review Signed" },
      { timestamp: new Date(nowMs - 1 * 3600000).toISOString(), action: "Invoice Settled (CGHS Package Rate). Claim submitted." }
    ]
  });

  // Seed CGHS claim in claim tracker
  if (!state.daycareClaimTracking) state.daycareClaimTracking = [];
  state.daycareClaimTracking.push({
    claim_id: "CLM-DC-890421",
    admission_id: "DC-ADM-4790",
    invoice_id: "INV-DC-ADM-4790",
    payer_name: "CGHS",
    patientName: dcPatient4.name,
    uhid: dcPatient4.uhid,
    status: "Pending",
    invoice_amount: 4930,
    submitted_at: new Date(nowMs - 1 * 3600000).toISOString(),
    settled_at: null
  });

  // Seed NDPS register with one historical entry from the Hernia Repair case
  if (!state.daycareNDPSRegister) state.daycareNDPSRegister = [];
  state.daycareNDPSRegister.push({
    entry_id: "NDPS-4801-01",
    admission_id: "DC-ADM-4801",
    drug_name: "Inj. Tramadol 50mg",
    quantity: 2,
    batch_no: "BT-55821",
    expiry: "2026-11",
    dispensed_by: "Pharmacist Ramesh Kumar",
    patient_name: dcPatients[2].name,
    patient_uhid: dcPatients[2].uhid,
    doctor_id: "Dr. Srinivasan",
    timestamp: new Date(nowMs - 7.8 * 3600000).toISOString()
  });

  // Seed rich audit trail for all 4 admissions
  if (!state.daycareAuditLogs) state.daycareAuditLogs = [];
  const auditBase = [
    { timestamp: timeA, uhid: dcPatients[0].uhid, patientName: dcPatients[0].name, action: "Intake Booked", role: "Reception", previousStatus: null, newStatus: "Booked", category: "clinical", details: "Booked DC-B1 for Chemotherapy Infusion. Payer: Star Health." },
    { timestamp: timeA, uhid: dcPatients[0].uhid, patientName: dcPatients[0].name, action: "Consent Captured", role: "Reception", category: "clinical", details: "Procedure consent obtained. ABHA ID 14-8002-9876-1234 linked with patient consent." },
    { timestamp: timeB, uhid: dcPatients[1].uhid, patientName: dcPatients[1].name, action: "Intake Booked", role: "Reception", previousStatus: null, newStatus: "Booked", category: "clinical", details: "Booked DC-B2 for Cataract Surgery. Payer: HDFC ERGO." },
    { timestamp: timeB, uhid: dcPatients[1].uhid, patientName: dcPatients[1].name, action: "Consent Captured", role: "Reception", category: "clinical", details: "Procedure consent + Anesthesia consent obtained." },
    { timestamp: timeB, uhid: dcPatients[1].uhid, patientName: dcPatients[1].name, action: "Pre-Treatment Verification Completed", role: "Daycare Nurse", previousStatus: "Admitted", newStatus: "Under Treatment", category: "clinical", details: "All pre-treatment checks passed. Treatment initiated." },
    { timestamp: new Date(nowMs - 8.8 * 3600000).toISOString(), uhid: dcPatients[1].uhid, patientName: dcPatients[1].name, action: "Drug Dispensed", role: "Pharmacist", category: "pharmacy", details: "Inj. Midazolam 2mg x1 | Batch: BT-88211 | Exp: 2026-12 | Cost: ₹85" },
    { timestamp: timeC, uhid: dcPatients[2].uhid, patientName: dcPatients[2].name, action: "Intake Booked", role: "Reception", previousStatus: null, newStatus: "Booked", category: "clinical", details: "Booked DC-B3 for Laparoscopic Hernia Repair. Payer: Self Pay." },
    { timestamp: timeC, uhid: dcPatients[2].uhid, patientName: dcPatients[2].name, action: "Pre-Treatment Verification Completed", role: "Daycare Nurse", previousStatus: "Admitted", newStatus: "Under Treatment", category: "clinical", details: "All checks passed. Hernia repair initiated." },
    { timestamp: new Date(nowMs - 7.8 * 3600000).toISOString(), uhid: dcPatients[2].uhid, patientName: dcPatients[2].name, action: "Drug Dispensed", role: "Pharmacist", category: "pharmacy", details: "Inj. Tramadol 50mg x2 | Batch: BT-55821 | Exp: 2026-11 | Cost: ₹76" },
    { timestamp: new Date(nowMs - 7.8 * 3600000).toISOString(), uhid: dcPatients[2].uhid, patientName: dcPatients[2].name, action: "NDPS Register Entry", role: "Pharmacist", category: "ndps", details: "NDPS/Sch-H1 drug Inj. Tramadol 50mg dispensed. Batch: BT-55821. Cross-ref Admission: DC-ADM-4801." },
    { timestamp: timeD, uhid: dcPatient4.uhid, patientName: dcPatient4.name, action: "Intake Booked", role: "Reception", previousStatus: null, newStatus: "Booked", category: "clinical", details: "Booked DC-B4 for Endoscopy Scope Evaluation. Payer: CGHS." },
    { timestamp: timeD, uhid: dcPatient4.uhid, patientName: dcPatient4.name, action: "Consent Captured", role: "Reception", category: "clinical", details: "Procedure consent + Anesthesia consent. ABHA ID 23-5501-8822-9910 linked." },
    { timestamp: new Date(nowMs - 8.5 * 3600000).toISOString(), uhid: dcPatient4.uhid, patientName: dcPatient4.name, action: "Drug Dispensed", role: "Pharmacist", category: "pharmacy", details: "Inj. Midazolam 2mg x1 | Batch: BT-21099 | Exp: 2026-10 | Cost: ₹85" },
    { timestamp: new Date(nowMs - 1.5 * 3600000).toISOString(), uhid: dcPatient4.uhid, patientName: dcPatient4.name, action: "Discharge Readiness Approved", role: "Daycare Physician", previousStatus: "Observation", newStatus: "Ready for Discharge", category: "clinical", details: "Doctor signed off fit for discharge. Aldrete 10/10." },
    { timestamp: new Date(nowMs - 1 * 3600000).toISOString(), uhid: dcPatient4.uhid, patientName: dcPatient4.name, action: "Invoice Settled", role: "Billing Desk", previousStatus: "Ready for Discharge", newStatus: "Ready for Discharge", category: "billing", details: "Gross: ₹4930 | CGHS Package: ₹4500 | Pharmacy+GST: ₹502 | Net Payable: ₹0" },
    { timestamp: new Date(nowMs - 1 * 3600000).toISOString(), uhid: dcPatient4.uhid, patientName: dcPatient4.name, action: "Cashless Claim Submitted", role: "Billing Desk", category: "billing", details: "Claim CLM-DC-890421 submitted to CGHS for ₹4930. Discharge NOT blocked on settlement." }
  ];
  auditBase.forEach(e => state.daycareAuditLogs.push(e));

  // Assign these beds as Occupied in state.bedsStatus
  state.bedsStatus["DC-B1"] = { wardKey: "DAYCARE", status: "Occupied", patientUhid: dcPatients[0].uhid, notes: "Chemotherapy Infusion" };
  state.bedsStatus["DC-B2"] = { wardKey: "DAYCARE", status: "Occupied", patientUhid: dcPatients[1].uhid, notes: "Cataract Surgery" };
  state.bedsStatus["DC-B3"] = { wardKey: "DAYCARE", status: "Occupied", patientUhid: dcPatients[2].uhid, notes: "Laparoscopic Hernia Repair" };
  state.bedsStatus["DC-B4"] = { wardKey: "DAYCARE", status: "Occupied", patientUhid: dcPatient4.uhid, notes: "Endoscopy (Ready for Discharge)" };

  // Set DC-B5 to DC-B10 as Available
  for (let i = 5; i <= 10; i++) {
    state.bedsStatus[`DC-B${i}`] = { wardKey: "DAYCARE", status: "Available", patientUhid: null, notes: "" };
  }

  // Pre-seed local storage so it loads properly immediately
  localStorage.setItem('saronil_daycare_admissions', JSON.stringify(state.daycareAdmissions));

  // Initialize Housekeeping structures
  state.hkSlaSettings = JSON.parse(localStorage.getItem('saronil_hk_sla_settings')) || {
    'Discharge Cleaning': 30,
    'Isolation Room Cleaning': 15,
    'OT Cleaning': 20,
    'Bed Cleaning': 45,
    'General Room Cleaning': 60,
    'Public Area Cleaning': 60,
    'Scheduled Cleaning': 60
  };

  state.hkStaffList = JSON.parse(localStorage.getItem('saronil_hk_staff')) || [
    { id: "HK-STF01", name: "Ramu K.", shift: "Morning", activeTasks: 1 },
    { id: "HK-STF02", name: "Somu L.", shift: "Morning", activeTasks: 1 },
    { id: "HK-STF03", name: "Ajay S.", shift: "Afternoon", activeTasks: 0 },
    { id: "HK-STF04", name: "Shalini V.", shift: "Afternoon", activeTasks: 0 },
    { id: "HK-STF05", name: "Vijay M.", shift: "Night", activeTasks: 0 },
    { id: "HK-STF06", name: "Priya S.", shift: "Night", activeTasks: 0 }
  ];

  state.hkAuditLogs = JSON.parse(localStorage.getItem('saronil_hk_audit_logs')) || [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), user: "System", role: "System", action: "AUTO_CREATE", taskId: "HK-1001", roomBed: "GW(M)-409", remarks: "Discharge order confirmed for patient, task created." }
  ];

  state.housekeepingTasks = JSON.parse(localStorage.getItem('saronil_housekeeping_tasks')) || [
    {
      id: "HK-1001",
      type: "Discharge Cleaning",
      source: "IPD",
      bedId: "GW(M)-409",
      status: "New",
      createdTime: new Date(Date.now() - 720000).toISOString(), // 12 minutes ago -> triggers supervisor warning if unassigned > 10 min
      assignee: null,
      assignedTime: null,
      completedTime: null,
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "Floor mopped with disinfectant": false,
        "Surfaces wiped": false,
        "Bin emptied and relined": false,
        "Linen changed": false,
        "Bathroom cleaned": false,
        "Equipment wiped": false
      },
      audit: [
        { timestamp: new Date(Date.now() - 720000).toISOString(), user: "System", role: "System", action: "AUTO_CREATE", remarks: "System auto-created task on patient discharge order confirmation." }
      ]
    },
    {
      id: "HK-1002",
      type: "Bed Cleaning",
      source: "IPD",
      bedId: "SP-301",
      status: "Assigned",
      createdTime: new Date(Date.now() - 1200000).toISOString(),
      assignee: "Ramu K.",
      assignedTime: new Date(Date.now() - 1100000).toISOString(),
      completedTime: null,
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "Mattress wipe": false,
        "Surfaces wiped": false,
        "Bin emptied and relined": false
      },
      audit: [
        { timestamp: new Date(Date.now() - 1200000).toISOString(), user: "Nurse Anjali", role: "Ward Nurse", action: "CREATE", remarks: "Manual request raised by ward nursing desk." },
        { timestamp: new Date(Date.now() - 1100000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "ASSIGN", remarks: "Assigned to Ramu K. for Morning shift." }
      ]
    },
    {
      id: "HK-1003",
      type: "Isolation Room Cleaning",
      source: "IPD",
      bedId: "PVT-201",
      status: "In Progress",
      createdTime: new Date(Date.now() - 600000).toISOString(),
      assignee: "Somu L.",
      assignedTime: new Date(Date.now() - 550000).toISOString(),
      completedTime: null,
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "PPE donned": true,
        "Enhanced disinfectant used": true,
        "Post-clean fumigation logged": false,
        "IC Nurse notified": false,
        "Floor mopped with disinfectant": false,
        "Surfaces wiped": false,
        "Bin emptied and relined": false
      },
      audit: [
        { timestamp: new Date(Date.now() - 600000).toISOString(), user: "Nurse Preeti", role: "IC Nurse", action: "CREATE", remarks: "Isolation room release terminal clean requested." },
        { timestamp: new Date(Date.now() - 550000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "ASSIGN", remarks: "Assigned to Somu L. on priority." }
      ]
    },
    {
      id: "HK-1004",
      type: "General Room Cleaning",
      source: "ICU",
      bedId: "CCU-BED-02",
      status: "Completed",
      createdTime: new Date(Date.now() - 1800000).toISOString(),
      assignee: "Ramu K.",
      assignedTime: new Date(Date.now() - 1700000).toISOString(),
      completedTime: new Date(Date.now() - 100000).toISOString(),
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "Floor mopped with disinfectant": true,
        "Surfaces wiped": true,
        "Bin emptied and relined": true,
        "Equipment wiped": true
      },
      audit: [
        { timestamp: new Date(Date.now() - 1800000).toISOString(), user: "Nurse Deepa", role: "Ward Nurse", action: "CREATE", remarks: "Routine daily room sanitisation." },
        { timestamp: new Date(Date.now() - 1700000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "ASSIGN", remarks: "Assigned to Ramu K." },
        { timestamp: new Date(Date.now() - 100000).toISOString(), user: "Ramu K.", role: "HK Staff", action: "COMPLETE", remarks: "Standard clean completed, checklist items validated." }
      ]
    },
    {
      id: "HK-1005",
      type: "Discharge Cleaning",
      source: "IPD",
      bedId: "GW(F)-414",
      status: "Verified",
      createdTime: new Date(Date.now() - 3600000).toISOString(),
      assignee: "Somu L.",
      assignedTime: new Date(Date.now() - 3500000).toISOString(),
      completedTime: new Date(Date.now() - 1500000).toISOString(),
      verifiedTime: new Date(Date.now() - 1000000).toISOString(),
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "Floor mopped with disinfectant": true,
        "Surfaces wiped": true,
        "Bin emptied and relined": true,
        "Linen changed": true,
        "Bathroom cleaned": true,
        "Equipment wiped": true
      },
      audit: [
        { timestamp: new Date(Date.now() - 3600000).toISOString(), user: "System", role: "System", action: "AUTO_CREATE", remarks: "Auto-created on patient discharge order." },
        { timestamp: new Date(Date.now() - 3500000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "ASSIGN", remarks: "Assigned to Somu L." },
        { timestamp: new Date(Date.now() - 1500000).toISOString(), user: "Somu L.", role: "HK Staff", action: "COMPLETE", remarks: "Clean complete." },
        { timestamp: new Date(Date.now() - 1000000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "VERIFY", remarks: "Clean inspected and verified. Bed released to Ready." }
      ]
    }
  ];

  // Set some beds to Dirty or Blocked for demonstration
  state.bedsStatus["GW(M)-409"] = { wardKey: "GENERAL-WARD-M", status: "Dirty", patientUhid: null, notes: "Discharged patient" };
  state.bedsStatus["SP-301"] = { wardKey: "SEMI-PRIVATE", status: "Dirty", patientUhid: null, notes: "Awaiting clean" };
  state.bedsStatus["PVT-201"] = { wardKey: "PRIVATE", status: "Cleaning", patientUhid: null, notes: "Isolation clean in progress" };
  state.bedsStatus["CCU-BED-02"] = { wardKey: "CCU", status: "Cleaning", patientUhid: null, notes: "Daily routine clean in progress" };
  state.bedsStatus["DELUXE-401"] = { wardKey: "DELUXE", status: "Blocked", patientUhid: null, notes: "AC servicing in progress" };

  // Initialize Laundry stock & active batches
  state.laundryLinenStock = JSON.parse(localStorage.getItem('saronil_laundry_linen_stock')) || [
    { item: "Double Bed Sheets", available: 180, dirty: 45, minStock: 50 },
    { item: "Pillow Covers", available: 220, dirty: 60, minStock: 60 },
    { item: "OT Towels", available: 95, dirty: 15, minStock: 30 },
    { item: "Doctor Gowns", available: 54, dirty: 8, minStock: 20 }
  ];

  state.laundryBatches = JSON.parse(localStorage.getItem('saronil_laundry_batches')) || [
    { id: "LND-B001", dispatchTime: new Date(Date.now() - 7200000).toISOString(), items: "Double Bed Sheets x30", status: "Sent to Laundry", expectedReturn: new Date(Date.now() + 14400000).toISOString() },
    { id: "LND-B002", dispatchTime: new Date(Date.now() - 86400000).toISOString(), items: "OT Towels x15, Doctor Gowns x10", status: "Clean Received", expectedReturn: new Date(Date.now() - 7200000).toISOString() }
  ];

  // Initialize CSSD stock & loads
  state.cssdInventory = JSON.parse(localStorage.getItem('saronil_cssd_inventory')) || [
    { kitName: "Ortho Surgical Kit A", available: 6, dirty: 2, sterilizedAt: new Date(Date.now() - 18000000).toISOString() },
    { kitName: "General Surgery Pack", available: 12, dirty: 4, sterilizedAt: new Date(Date.now() - 7200000).toISOString() },
    { kitName: "Cardio Surgical Tray B", available: 3, dirty: 1, sterilizedAt: new Date(Date.now() - 86400000).toISOString() }
  ];

  state.cssdActiveLoads = JSON.parse(localStorage.getItem('saronil_cssd_active_loads')) || [
    { loadId: "LOAD-2041", machine: "Autoclave-01 (Pre-Vac)", loadType: "General Surgery Packs", temp: 134, time: 30, status: "Sterilization in Progress", startedAt: new Date(Date.now() - 900000).toISOString() }
  ];

  // Initialize Laundry Department Stock levels (Low / Critical alerts)
  state.laundryDeptStock = JSON.parse(localStorage.getItem('saronil_laundry_dept_stock')) || [
    { dept: "ICU Ward", available: 12, status: "Critical", minStock: 25 },
    { dept: "OT Complex", available: 8, status: "Critical", minStock: 20 },
    { dept: "IPD Wards", available: 95, status: "OK", minStock: 80 },
    { dept: "OPD Clinics", available: 14, status: "Low", minStock: 30 }
  ];
  state.laundryVendorOverdue = JSON.parse(localStorage.getItem('saronil_laundry_vendor_overdue')) || true;

  // Initialize CSSD active sterilizations
  state.cssdActiveSterilizations = JSON.parse(localStorage.getItem('saronil_cssd_active_sterilizations')) || [
    { id: "CSSD-T101", name: "Ortho Major Kit A", stage: "Sterilizing", requestedBy: "OT Room 2", startedAt: new Date(Date.now() - 3600000).toISOString(), eta: new Date(Date.now() + 1800000).toISOString(), status: "On Time", expired: false },
    { id: "CSSD-T102", name: "General Delivery Tray", stage: "Ready", requestedBy: "Maternity Ward", startedAt: new Date(Date.now() - 72000000).toISOString(), eta: new Date(Date.now() - 18000000).toISOString(), status: "On Time", expired: true, expiryDate: new Date(Date.now() - 86400000).toISOString() },
    { id: "CSSD-T103", name: "Cardio Surgery Pack B", stage: "Decontamination", requestedBy: "OT Room 1", startedAt: new Date(Date.now() - 1800000).toISOString(), eta: new Date(Date.now() + 7200000).toISOString(), status: "On Time", expired: false }
  ];
  state.cssdOverdueReturnsAlert = JSON.parse(localStorage.getItem('saronil_cssd_overdue_returns_alert')) || "Alert: 2 Ortho kits overdue for return from Ward-3 since yesterday.";

  // Initialize BMW bags including overdue bags (> 4 hours)
  state.bmwBags = JSON.parse(localStorage.getItem('saronil_bmw_bags')) || [
    { bagId: "BMW-B01", category: "Red Bag (Infected Plastics)", weight: 4.2, department: "IPD Ward", collectedAt: new Date(Date.now() - 1800000).toISOString() },
    { bagId: "BMW-B02", category: "Yellow Bag (Anatomical Waste)", weight: 2.8, department: "OT Complex", collectedAt: new Date(Date.now() - 18000000).toISOString() }, // 5 hours ago (overdue)
    { bagId: "BMW-B03", category: "Blue Glass (Ampoules/Vials)", weight: 1.5, department: "ICU Ward", collectedAt: new Date(Date.now() - 5400000).toISOString() }
  ];
  state.bmwVendorOverdue = JSON.parse(localStorage.getItem('saronil_bmw_vendor_overdue')) || true;
  state.bmwManifestSubmissions = JSON.parse(localStorage.getItem('saronil_bmw_manifest_submissions')) || {
    "IPD Ward": "Submitted",
    "OT Complex": "Submitted",
    "ICU Ward": "Submitted",
    "OPD Clinic": "Missing"
  };

  // Seed detailed HK Audit logs with sub-module markers
  state.hkAuditLogs = JSON.parse(localStorage.getItem('saronil_hk_audit_logs')) || [
    { timestamp: new Date(Date.now() - 1800000).toISOString(), user: "System", role: "System", action: "AUTO_CREATE", subModule: "HK Ops", locationItem: "Bed GW(M)-409", remarks: "Discharge order confirmed for patient, task created." },
    { timestamp: new Date(Date.now() - 3600000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "ASSIGN", subModule: "HK Ops", locationItem: "Bed SP-301", remarks: "Assigned task to Ramu K." },
    { timestamp: new Date(Date.now() - 5400000).toISOString(), user: "Ramu K.", role: "HK Staff", action: "LAUNDRY_DISPATCH", subModule: "Laundry", locationItem: "Double Bed Sheets x30", remarks: "Sent dirty sheets to external vendor." },
    { timestamp: new Date(Date.now() - 7200000).toISOString(), user: "Sister Anitha", role: "Infection Control Nurse", action: "IC_SIGN_OFF", subModule: "HK Ops", locationItem: "Bed PVT-201", remarks: "Isolation clean signed off." },
    { timestamp: new Date(Date.now() - 9000000).toISOString(), user: "Technician Raj", role: "CSSD Staff", action: "CSSD_LOAD", subModule: "CSSD", locationItem: "General Surgery Pack", remarks: "Autoclave machine pre-vacuum load initiated." },
    { timestamp: new Date(Date.now() - 10800000).toISOString(), user: "Somu L.", role: "HK Staff", action: "BMW_COLLECT", subModule: "BMW", locationItem: "Yellow Bag", remarks: "Collected anatomical waste from OT." }
  ];

  // Seed Scheduled Cleaning configurations (Schedules list)
  state.hkSchedules = JSON.parse(localStorage.getItem('saronil_hk_schedules')) || [
    { areaName: "OPD Waiting Area", frequency: "Daily", times: "07:00, 13:00, 19:00", zone: "OPD Zone", staff: "Ramu K.", nextDue: new Date(Date.now() + 7200000).toISOString(), lastCompleted: new Date(Date.now() - 14400000).toISOString(), status: "Active" },
    { areaName: "Corridors", frequency: "Daily", times: "06:00, 18:00", zone: "General Zone", staff: "Somu L.", nextDue: new Date(Date.now() - 900000).toISOString(), lastCompleted: new Date(Date.now() - 36000000).toISOString(), status: "Missed" }, // 15 mins overdue
    { areaName: "ICU", frequency: "Daily", times: "06:00, 14:00", zone: "ICU Zone", staff: "Ajay S.", nextDue: new Date(Date.now() + 3600000).toISOString(), lastCompleted: new Date(Date.now() - 28800000).toISOString(), status: "Active" }
  ];

  // Seed Quality Inspections database
  state.hkInspections = JSON.parse(localStorage.getItem('saronil_hk_inspections')) || [
    { id: "INSP-501", area: "IPD Wards", date: new Date().toISOString().slice(0, 10), shift: "Morning", inspector: "Manager Satish", score: 4.8, threshold: 3.5, remarks: "Excellent cleanliness maintained." },
    { id: "INSP-502", area: "OPD Waiting Area", date: new Date().toISOString().slice(0, 10), shift: "Morning", inspector: "Manager Satish", score: 2.8, threshold: 3.5, remarks: "Dust on chairs. Cleanliness scores breached threshold.", rootCause: "Lack of cleaning consumables in OPD closet." }
  ];

  localStorage.setItem('saronil_hk_sla_settings', JSON.stringify(state.hkSlaSettings));
  localStorage.setItem('saronil_hk_staff', JSON.stringify(state.hkStaffList));
  localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(state.hkAuditLogs));
  localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(state.housekeepingTasks));
  localStorage.setItem('saronil_bedsStatus', JSON.stringify(state.bedsStatus));
  seedBedActivityLogs();
  localStorage.setItem('saronil_laundry_linen_stock', JSON.stringify(state.laundryLinenStock));
  localStorage.setItem('saronil_laundry_batches', JSON.stringify(state.laundryBatches));
  localStorage.setItem('saronil_cssd_inventory', JSON.stringify(state.cssdInventory));
  localStorage.setItem('saronil_cssd_active_loads', JSON.stringify(state.cssdActiveLoads));
  localStorage.setItem('saronil_bmw_manifests', JSON.stringify(state.bmwManifests));
  localStorage.setItem('saronil_bmw_bags', JSON.stringify(state.bmwBags));
  localStorage.setItem('saronil_laundry_dept_stock', JSON.stringify(state.laundryDeptStock));
  localStorage.setItem('saronil_laundry_vendor_overdue', JSON.stringify(state.laundryVendorOverdue));
  localStorage.setItem('saronil_cssd_active_sterilizations', JSON.stringify(state.cssdActiveSterilizations));
  localStorage.setItem('saronil_cssd_overdue_returns_alert', JSON.stringify(state.cssdOverdueReturnsAlert));
  localStorage.setItem('saronil_bmw_vendor_overdue', JSON.stringify(state.bmwVendorOverdue));
  localStorage.setItem('saronil_bmw_manifest_submissions', JSON.stringify(state.bmwManifestSubmissions));
  localStorage.setItem('saronil_hk_schedules', JSON.stringify(state.hkSchedules));
  localStorage.setItem('saronil_hk_inspections', JSON.stringify(state.hkInspections));

  window.state = state;

/* ==========================================================================
   CENTRALIZED PATIENT TIMELINE LOGGER
   Call from ANY module:
     window.logPatientTimeline(uhid, { icon, title, desc, type })
   ========================================================================== */
window.logPatientTimeline = function(uhid, event) {
  if (!uhid || !event) return;
  const st = window.state || state;
  if (!st || !st.patients) return;
  const pat = st.patients.find(p => p.uhid === uhid);
  if (!pat) return;
  pat.timelineEvents = pat.timelineEvents || [];
  pat.timelineEvents.unshift({
    date: new Date().toISOString(),
    type: event.type || 'general',
    icon: event.icon || '📌',
    title: event.title || 'Activity',
    desc: event.desc || ''
  });
  // Persist immediately so timeline survives page refresh
  try { localStorage.setItem('saronil_patients', JSON.stringify(st.patients)); } catch(e) {}
};

function seedBedActivityLogs() {
  state.bedActivityLogs = [
    {
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      bedId: "GW(M)-409",
      wardKey: "GENERAL-WARD-M",
      activityType: "RELEASE",
      patientName: "Rajan Pillai",
      patientUhid: "SH-2026-04850",
      performedBy: "ATD Coordinator",
      details: "Bed GW(M)-409 vacated after discharge checkout of Rajan Pillai."
    },
    {
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      bedId: "GW(M)-409",
      wardKey: "GENERAL-WARD-M",
      activityType: "STATUS_CHANGE",
      patientName: "N/A",
      patientUhid: "",
      performedBy: "Nursing Supervisor",
      details: "Bed GW(M)-409 status updated to Dirty. Housekeeping notified."
    },
    {
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      bedId: "SP-301",
      wardKey: "SEMI-PRIVATE",
      activityType: "RELEASE",
      patientName: "Deepak Verma",
      patientUhid: "SH-2026-04755",
      performedBy: "ATD Coordinator",
      details: "Bed SP-301 vacated after discharge checkout of Deepak Verma."
    },
    {
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
      bedId: "PVT-201",
      wardKey: "PRIVATE",
      activityType: "STATUS_CHANGE",
      patientName: "N/A",
      patientUhid: "",
      performedBy: "Nursing Supervisor",
      details: "Bed PVT-201 status updated to Cleaning (Isolation clean in progress)."
    },
    {
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      bedId: "DELUXE-401",
      wardKey: "DELUXE",
      activityType: "STATUS_CHANGE",
      patientName: "N/A",
      patientUhid: "",
      performedBy: "Administrator",
      details: "Bed DELUXE-401 blocked for AC servicing maintenance."
    },
    {
      timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
      bedId: "GW(M)-410",
      wardKey: "GENERAL-WARD-M",
      activityType: "ALLOCATION",
      patientName: "Rajesh Kumar",
      patientUhid: "SH-2026-04821",
      performedBy: "ATD Coordinator",
      details: "Allocated general bed GW(M)-410 to Rajesh Kumar on admission."
    }
  ];
  localStorage.setItem('saronil_bedActivityLogs', JSON.stringify(state.bedActivityLogs));
}

state.logBedActivity = function(bedId, wardKey, activityType, patientUhid, details) {
  state.bedActivityLogs = state.bedActivityLogs || [];
  
  var patName = 'N/A';
  if (patientUhid) {
    var p = (state.patients || []).find(pt => pt.uhid === patientUhid);
    if (p) patName = p.name;
  }
  
  var userRole = window._ipdActiveRole || state.activeUserRole || 'ATD Coordinator';
  
  state.bedActivityLogs.unshift({
    timestamp: new Date().toISOString(),
    bedId: bedId,
    wardKey: wardKey,
    activityType: activityType,
    patientName: patName,
    patientUhid: patientUhid || '',
    performedBy: userRole,
    details: details
  });
  
  // Cap at 100 entries to prevent localstorage bloat
  if (state.bedActivityLogs.length > 100) {
    state.bedActivityLogs = state.bedActivityLogs.slice(0, 100);
  }
  
  localStorage.setItem('saronil_bedActivityLogs', JSON.stringify(state.bedActivityLogs));
};

