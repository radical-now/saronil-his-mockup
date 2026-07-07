/* ==========================================================================
   SARONIL HMS - IPD MEDICATION ORDERS (Rx) MODULE
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. DYNAMIC MEDICINE DATABASE SEEDING (EXACTLY 100 HIS MEDICINES)
// --------------------------------------------------------------------------
window.medicationCatalog = [
  {
    "brandName": "Calpol 500",
    "genericName": "Paracetamol",
    "saltComposition": "Paracetamol 500mg",
    "strength": "500mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 12,
    "category": "General Medicine",
    "code": "RX-MED-001",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Calpol 650",
    "genericName": "Paracetamol",
    "saltComposition": "Paracetamol 650mg",
    "strength": "650mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 14,
    "category": "General Medicine",
    "code": "RX-MED-002",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Brufen 400",
    "genericName": "Ibuprofen",
    "saltComposition": "Ibuprofen 400mg",
    "strength": "400mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 18,
    "category": "General Medicine",
    "code": "RX-MED-003",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Combiflam",
    "genericName": "Ibuprofen + Paracetamol",
    "saltComposition": "Ibuprofen 400mg + Paracetamol 325mg",
    "strength": "725mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 20,
    "category": "General Medicine",
    "code": "RX-MED-004",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Pantocid 40",
    "genericName": "Pantoprazole",
    "saltComposition": "Pantoprazole 40mg",
    "strength": "40mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 80,
    "category": "General Medicine",
    "code": "RX-MED-005",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Pan 40",
    "genericName": "Pantoprazole",
    "saltComposition": "Pantoprazole 40mg",
    "strength": "40mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 85,
    "category": "General Medicine",
    "code": "RX-MED-006",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Pan-D",
    "genericName": "Pantoprazole + Domperidone",
    "saltComposition": "Pantoprazole 40mg + Domperidone 30mg",
    "strength": "70mg",
    "dosageForm": "Capsule",
    "route": "PO",
    "price": 120,
    "category": "General Medicine",
    "code": "RX-MED-007",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Omez 20",
    "genericName": "Omeprazole",
    "saltComposition": "Omeprazole 20mg",
    "strength": "20mg",
    "dosageForm": "Capsule",
    "route": "PO",
    "price": 60,
    "category": "General Medicine",
    "code": "RX-MED-008",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Sompraz 40",
    "genericName": "Esomeprazole",
    "saltComposition": "Esomeprazole 40mg",
    "strength": "40mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 110,
    "category": "General Medicine",
    "code": "RX-MED-009",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Rabicip 20",
    "genericName": "Rabeprazole",
    "saltComposition": "Rabeprazole 20mg",
    "strength": "20mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 95,
    "category": "General Medicine",
    "code": "RX-MED-010",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Aciloc 150",
    "genericName": "Ranitidine",
    "saltComposition": "Ranitidine 150mg",
    "strength": "150mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 25,
    "category": "General Medicine",
    "code": "RX-MED-011",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Cremaffin Syrup",
    "genericName": "Liquid Paraffin + Milk of Magnesia",
    "saltComposition": "Liquid Paraffin 3.75ml + Milk of Magnesia 11.25ml",
    "strength": "15ml",
    "dosageForm": "Syrup",
    "route": "PO",
    "price": 150,
    "category": "General Medicine",
    "code": "RX-MED-012",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Duphalac",
    "genericName": "Lactulose",
    "saltComposition": "Lactulose 10g/15ml",
    "strength": "10g/15ml",
    "dosageForm": "Syrup",
    "route": "PO",
    "price": 220,
    "category": "General Medicine",
    "code": "RX-MED-013",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Dulcolax 5",
    "genericName": "Bisacodyl",
    "saltComposition": "Bisacodyl 5mg",
    "strength": "5mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 12,
    "category": "General Medicine",
    "code": "RX-MED-014",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Loperamide 2",
    "genericName": "Loperamide",
    "saltComposition": "Loperamide 2mg",
    "strength": "2mg",
    "dosageForm": "Capsule",
    "route": "PO",
    "price": 10,
    "category": "General Medicine",
    "code": "RX-MED-015",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Eldoper",
    "genericName": "Loperamide",
    "saltComposition": "Loperamide 2mg",
    "strength": "2mg",
    "dosageForm": "Capsule",
    "route": "PO",
    "price": 11,
    "category": "General Medicine",
    "code": "RX-MED-016",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "ORS Sachet",
    "genericName": "Oral Rehydration Salts",
    "saltComposition": "Oral Rehydration Salts 21.8g",
    "strength": "21.8g",
    "dosageForm": "Powder",
    "route": "PO",
    "price": 22,
    "category": "General Medicine",
    "code": "RX-MED-017",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Cyclopam",
    "genericName": "Dicyclomine + Paracetamol",
    "saltComposition": "Dicyclomine 20mg + Paracetamol 325mg",
    "strength": "345mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 45,
    "category": "General Medicine",
    "code": "RX-MED-018",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Buscopan 10",
    "genericName": "Hyoscine Butylbromide",
    "saltComposition": "Hyoscine Butylbromide 10mg",
    "strength": "10mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 35,
    "category": "General Medicine",
    "code": "RX-MED-019",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Meftal-Spas",
    "genericName": "Mefenamic Acid + Dicyclomine",
    "saltComposition": "Mefenamic Acid 250mg + Dicyclomine 10mg",
    "strength": "260mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 40,
    "category": "General Medicine",
    "code": "RX-MED-020",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Febrex Plus",
    "genericName": "Chlorpheniramine + Paracetamol + Phenylephrine",
    "saltComposition": "Chlorpheniramine 2mg + Paracetamol 500mg + Phenylephrine 5mg",
    "strength": "507mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 35,
    "category": "General Medicine",
    "code": "RX-MED-021",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Sinarest",
    "genericName": "Chlorpheniramine + Paracetamol + Phenylephrine",
    "saltComposition": "Chlorpheniramine 2mg + Paracetamol 500mg + Phenylephrine 5mg",
    "strength": "507mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 30,
    "category": "General Medicine",
    "code": "RX-MED-022",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "D-Cold Total",
    "genericName": "Chlorpheniramine + Paracetamol + Phenylephrine",
    "saltComposition": "Chlorpheniramine 2mg + Paracetamol 500mg + Phenylephrine 5mg",
    "strength": "507mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 25,
    "category": "General Medicine",
    "code": "RX-MED-023",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Wikoryl",
    "genericName": "Chlorpheniramine + Paracetamol + Phenylephrine",
    "saltComposition": "Chlorpheniramine 2mg + Paracetamol 500mg + Phenylephrine 5mg",
    "strength": "507mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 28,
    "category": "General Medicine",
    "code": "RX-MED-024",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Dolo 650",
    "genericName": "Paracetamol",
    "saltComposition": "Paracetamol 650mg",
    "strength": "650mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 15,
    "category": "General Medicine",
    "code": "RX-MED-025",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Mox 500",
    "genericName": "Amoxicillin",
    "saltComposition": "Amoxicillin 500mg",
    "strength": "500mg",
    "dosageForm": "Capsule",
    "route": "PO",
    "price": 70,
    "category": "Antibiotic",
    "code": "RX-MED-026",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Augmentin 625 DUO",
    "genericName": "Amoxicillin + Clavulanic Acid",
    "saltComposition": "Amoxicillin 500mg + Clavulanic Acid 125mg",
    "strength": "625mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 200,
    "category": "Antibiotic",
    "code": "RX-MED-027",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Clavam 625",
    "genericName": "Amoxicillin + Clavulanic Acid",
    "saltComposition": "Amoxicillin 500mg + Clavulanic Acid 125mg",
    "strength": "625mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 190,
    "category": "Antibiotic",
    "code": "RX-MED-028",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Azithral 500",
    "genericName": "Azithromycin",
    "saltComposition": "Azithromycin 500mg",
    "strength": "500mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 120,
    "category": "Antibiotic",
    "code": "RX-MED-029",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Taxim-O 200",
    "genericName": "Cefixime",
    "saltComposition": "Cefixime 200mg",
    "strength": "200mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 90,
    "category": "Antibiotic",
    "code": "RX-MED-030",
    "minStock": 100,
    "stock": 0
  },
  {
    "brandName": "Ceftum 500",
    "genericName": "Cefuroxime",
    "saltComposition": "Cefuroxime Axetil 500mg",
    "strength": "500mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 250,
    "category": "Antibiotic",
    "code": "RX-MED-031",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Cefakind 500",
    "genericName": "Cefuroxime",
    "saltComposition": "Cefuroxime Axetil 500mg",
    "strength": "500mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 245,
    "category": "Antibiotic",
    "code": "RX-MED-032",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Cifran 500",
    "genericName": "Ciprofloxacin",
    "saltComposition": "Ciprofloxacin 500mg",
    "strength": "500mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 40,
    "category": "Antibiotic",
    "code": "RX-MED-033",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Ciplox 500",
    "genericName": "Ciprofloxacin",
    "saltComposition": "Ciprofloxacin 500mg",
    "strength": "500mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 38,
    "category": "Antibiotic",
    "code": "RX-MED-034",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Loxof 500",
    "genericName": "Levofloxacin",
    "saltComposition": "Levofloxacin 500mg",
    "strength": "500mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 80,
    "category": "Antibiotic",
    "code": "RX-MED-035",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Oflomac 200",
    "genericName": "Ofloxacin",
    "saltComposition": "Ofloxacin 200mg",
    "strength": "200mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 55,
    "category": "Antibiotic",
    "code": "RX-MED-036",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Norflox 400",
    "genericName": "Norfloxacin",
    "saltComposition": "Norfloxacin 400mg",
    "strength": "400mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 65,
    "category": "Antibiotic",
    "code": "RX-MED-037",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Metrogyl 400",
    "genericName": "Metronidazole",
    "saltComposition": "Metronidazole 400mg",
    "strength": "400mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 20,
    "category": "Antibiotic",
    "code": "RX-MED-038",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Tiniba 500",
    "genericName": "Tinidazole",
    "saltComposition": "Tinidazole 500mg",
    "strength": "500mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 45,
    "category": "Antibiotic",
    "code": "RX-MED-039",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Doxy-1 LDR",
    "genericName": "Doxycycline",
    "saltComposition": "Doxycycline 100mg",
    "strength": "100mg",
    "dosageForm": "Capsule",
    "route": "PO",
    "price": 30,
    "category": "Antibiotic",
    "code": "RX-MED-040",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Minopress 100",
    "genericName": "Minocycline",
    "saltComposition": "Minocycline 100mg",
    "strength": "100mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 180,
    "category": "Antibiotic",
    "code": "RX-MED-041",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Claribid 500",
    "genericName": "Clarithromycin",
    "saltComposition": "Clarithromycin 500mg",
    "strength": "500mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 380,
    "category": "Antibiotic",
    "code": "RX-MED-042",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Roxy 150",
    "genericName": "Roxithromycin",
    "saltComposition": "Roxithromycin 150mg",
    "strength": "150mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 90,
    "category": "Antibiotic",
    "code": "RX-MED-043",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Zifi 200",
    "genericName": "Cefixime",
    "saltComposition": "Cefixime 200mg",
    "strength": "200mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 85,
    "category": "Antibiotic",
    "code": "RX-MED-044",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Podovid 200",
    "genericName": "Cefpodoxime",
    "saltComposition": "Cefpodoxime Proxetil 200mg",
    "strength": "200mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 160,
    "category": "Antibiotic",
    "code": "RX-MED-045",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Monocef-O 200",
    "genericName": "Cefpodoxime",
    "saltComposition": "Cefpodoxime Proxetil 200mg",
    "strength": "200mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 155,
    "category": "Antibiotic",
    "code": "RX-MED-046",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Linezolid 600",
    "genericName": "Linezolid",
    "saltComposition": "Linezolid 600mg",
    "strength": "600mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 320,
    "category": "Antibiotic",
    "code": "RX-MED-047",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Lizolid 600",
    "genericName": "Linezolid",
    "saltComposition": "Linezolid 600mg",
    "strength": "600mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 310,
    "category": "Antibiotic",
    "code": "RX-MED-048",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Farobact 200",
    "genericName": "Faropenem",
    "saltComposition": "Faropenem 200mg",
    "strength": "200mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 420,
    "category": "Antibiotic",
    "code": "RX-MED-049",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Rifaximin 400",
    "genericName": "Rifaximin",
    "saltComposition": "Rifaximin 400mg",
    "strength": "400mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 290,
    "category": "Antibiotic",
    "code": "RX-MED-050",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Monocef 1g Inj",
    "genericName": "Ceftriaxone",
    "saltComposition": "Ceftriaxone Sodium 1g",
    "strength": "1g",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 60,
    "category": "Injection",
    "code": "RX-MED-051",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Taxim 1g Inj",
    "genericName": "Cefotaxime",
    "saltComposition": "Cefotaxime Sodium 1g",
    "strength": "1g",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 40,
    "category": "Injection",
    "code": "RX-MED-052",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Pipzo 4.5g Inj",
    "genericName": "Piperacillin + Tazobactam",
    "saltComposition": "Piperacillin 4g + Tazobactam 0.5g",
    "strength": "4.5g",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 450,
    "category": "Injection",
    "code": "RX-MED-053",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Tazact 4.5g Inj",
    "genericName": "Piperacillin + Tazobactam",
    "saltComposition": "Piperacillin 4g + Tazobactam 0.5g",
    "strength": "4.5g",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 480,
    "category": "Injection",
    "code": "RX-MED-054",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Meronem 1g Inj",
    "genericName": "Meropenem",
    "saltComposition": "Meropenem 1g",
    "strength": "1g",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 950,
    "category": "Injection",
    "code": "RX-MED-055",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Pantocid IV 40",
    "genericName": "Pantoprazole",
    "saltComposition": "Pantoprazole Sodium 40mg",
    "strength": "40mg",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 50,
    "category": "Injection",
    "code": "RX-MED-056",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Pan IV 40",
    "genericName": "Pantoprazole",
    "saltComposition": "Pantoprazole Sodium 40mg",
    "strength": "40mg",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 48,
    "category": "Injection",
    "code": "RX-MED-057",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Emset Inj 4",
    "genericName": "Ondansetron",
    "saltComposition": "Ondansetron 4mg/2ml",
    "strength": "4mg/2ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 20,
    "category": "Injection",
    "code": "RX-MED-058",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Zofran Inj 4",
    "genericName": "Ondansetron",
    "saltComposition": "Ondansetron 4mg/2ml",
    "strength": "4mg/2ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 25,
    "category": "Injection",
    "code": "RX-MED-059",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Voveran Inj 75",
    "genericName": "Diclofenac",
    "saltComposition": "Diclofenac Sodium 75mg/1ml",
    "strength": "75mg/1ml",
    "dosageForm": "Injection",
    "route": "IM",
    "price": 15,
    "category": "Injection",
    "code": "RX-MED-060",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Dynapar AQ",
    "genericName": "Diclofenac",
    "saltComposition": "Diclofenac Sodium 75mg/1ml",
    "strength": "75mg/1ml",
    "dosageForm": "Injection",
    "route": "IM",
    "price": 18,
    "category": "Injection",
    "code": "RX-MED-061",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Lasix Inj 20",
    "genericName": "Furosemide",
    "saltComposition": "Furosemide 20mg/2ml",
    "strength": "20mg/2ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 12,
    "category": "Injection",
    "code": "RX-MED-062",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Amikacin 500 Inj",
    "genericName": "Amikacin",
    "saltComposition": "Amikacin 500mg",
    "strength": "500mg",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 80,
    "category": "Injection",
    "code": "RX-MED-063",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Gentamicin 80 Inj",
    "genericName": "Gentamicin",
    "saltComposition": "Gentamicin 80mg",
    "strength": "80mg",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 15,
    "category": "Injection",
    "code": "RX-MED-064",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Tramadol Inj 100",
    "genericName": "Tramadol",
    "saltComposition": "Tramadol 100mg/2ml",
    "strength": "100mg/2ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 30,
    "category": "Injection",
    "code": "RX-MED-065",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Decadron Inj 4",
    "genericName": "Dexamethasone",
    "saltComposition": "Dexamethasone Sodium Phosphate 4mg/ml",
    "strength": "4mg/ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 10,
    "category": "Injection",
    "code": "RX-MED-066",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Hydrocortisone 100 Inj",
    "genericName": "Hydrocortisone",
    "saltComposition": "Hydrocortisone Sodium Succinate 100mg",
    "strength": "100mg",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 65,
    "category": "Injection",
    "code": "RX-MED-067",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Methylprednisolone 40 Inj",
    "genericName": "Methylprednisolone",
    "saltComposition": "Methylprednisolone Sodium Succinate 40mg",
    "strength": "40mg",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 150,
    "category": "Injection",
    "code": "RX-MED-068",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Clexane 40mg Inj",
    "genericName": "Enoxaparin",
    "saltComposition": "Enoxaparin Sodium 40mg/0.4ml",
    "strength": "40mg/0.4ml",
    "dosageForm": "Injection",
    "route": "SC",
    "price": 420,
    "category": "Injection",
    "code": "RX-MED-069",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Fragmin 5000 Inj",
    "genericName": "Dalteparin",
    "saltComposition": "Dalteparin Sodium 5000 IU",
    "strength": "5000 IU",
    "dosageForm": "Injection",
    "route": "SC",
    "price": 380,
    "category": "Injection",
    "code": "RX-MED-070",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Normal Saline 0.9%",
    "genericName": "Normal Saline",
    "saltComposition": "Sodium Chloride 0.9% w/v",
    "strength": "500ml",
    "dosageForm": "IV Fluid",
    "route": "IV",
    "price": 50,
    "category": "IV Fluid",
    "code": "RX-MED-071",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Dextrose 5%",
    "genericName": "Dextrose",
    "saltComposition": "Dextrose 5% w/v",
    "strength": "500ml",
    "dosageForm": "IV Fluid",
    "route": "IV",
    "price": 50,
    "category": "IV Fluid",
    "code": "RX-MED-072",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Dextrose Normal Saline",
    "genericName": "Dextrose + Normal Saline",
    "saltComposition": "Dextrose 5% + Sodium Chloride 0.9% w/v",
    "strength": "500ml",
    "dosageForm": "IV Fluid",
    "route": "IV",
    "price": 55,
    "category": "IV Fluid",
    "code": "RX-MED-073",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Ringer Lactate",
    "genericName": "Ringer Lactate",
    "saltComposition": "Compound Sodium Lactate",
    "strength": "500ml",
    "dosageForm": "IV Fluid",
    "route": "IV",
    "price": 60,
    "category": "IV Fluid",
    "code": "RX-MED-074",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Isolyte-G",
    "genericName": "Isolyte G",
    "saltComposition": "Multi-electrolyte with Dextrose",
    "strength": "500ml",
    "dosageForm": "IV Fluid",
    "route": "IV",
    "price": 90,
    "category": "IV Fluid",
    "code": "RX-MED-075",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Isolyte-M",
    "genericName": "Isolyte M",
    "saltComposition": "Multi-electrolyte maintenance",
    "strength": "500ml",
    "dosageForm": "IV Fluid",
    "route": "IV",
    "price": 90,
    "category": "IV Fluid",
    "code": "RX-MED-076",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Mannitol 20%",
    "genericName": "Mannitol",
    "saltComposition": "Mannitol 20% w/v",
    "strength": "100ml",
    "dosageForm": "IV Fluid",
    "route": "IV",
    "price": 120,
    "category": "IV Fluid",
    "code": "RX-MED-077",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Normal Saline 100ml",
    "genericName": "Normal Saline",
    "saltComposition": "Sodium Chloride 0.9% w/v",
    "strength": "100ml",
    "dosageForm": "IV Fluid",
    "route": "IV",
    "price": 30,
    "category": "IV Fluid",
    "code": "RX-MED-078",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Half Normal Saline 0.45%",
    "genericName": "Normal Saline",
    "saltComposition": "Sodium Chloride 0.45% w/v",
    "strength": "500ml",
    "dosageForm": "IV Fluid",
    "route": "IV",
    "price": 55,
    "category": "IV Fluid",
    "code": "RX-MED-079",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Colloids / Voluven 6%",
    "genericName": "Hydroxyethyl Starch",
    "saltComposition": "Hydroxyethyl Starch 6% w/v",
    "strength": "500ml",
    "dosageForm": "IV Fluid",
    "route": "IV",
    "price": 650,
    "category": "IV Fluid",
    "code": "RX-MED-080",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Adrenaline Inj",
    "genericName": "Epinephrine",
    "saltComposition": "Epinephrine 1mg/ml",
    "strength": "1mg/ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 20,
    "category": "Emergency Drug",
    "code": "RX-MED-081",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Noradrenaline Inj",
    "genericName": "Norepinephrine",
    "saltComposition": "Norepinephrine 4mg/2ml",
    "strength": "4mg/2ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 60,
    "category": "Emergency Drug",
    "code": "RX-MED-082",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Atropine Inj",
    "genericName": "Atropine",
    "saltComposition": "Atropine Sulfate 0.6mg/ml",
    "strength": "0.6mg/ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 15,
    "category": "Emergency Drug",
    "code": "RX-MED-083",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Cordarone Inj",
    "genericName": "Amiodarone",
    "saltComposition": "Amiodarone Hydrochloride 150mg/3ml",
    "strength": "150mg/3ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 90,
    "category": "Emergency Drug",
    "code": "RX-MED-084",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Sodium Bicarbonate 7.5%",
    "genericName": "Sodium Bicarbonate",
    "saltComposition": "Sodium Bicarbonate 7.5% w/v",
    "strength": "25ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 50,
    "category": "Emergency Drug",
    "code": "RX-MED-085",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Calcium Gluconate 10%",
    "genericName": "Calcium Gluconate",
    "saltComposition": "Calcium Gluconate 10% w/v",
    "strength": "10ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 40,
    "category": "Emergency Drug",
    "code": "RX-MED-086",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Mephentine Inj",
    "genericName": "Mephentermine",
    "saltComposition": "Mephentermine Sulfate 30mg/ml",
    "strength": "30mg/ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 180,
    "category": "Emergency Drug",
    "code": "RX-MED-087",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Adenocor Inj",
    "genericName": "Adenosine",
    "saltComposition": "Adenosine 6mg/2ml",
    "strength": "6mg/2ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 350,
    "category": "Emergency Drug",
    "code": "RX-MED-088",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Digoxin Inj 0.5",
    "genericName": "Digoxin",
    "saltComposition": "Digoxin 0.5mg/2ml",
    "strength": "0.5mg/2ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 45,
    "category": "Emergency Drug",
    "code": "RX-MED-089",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Dopamine Inj 200",
    "genericName": "Dopamine",
    "saltComposition": "Dopamine Hydrochloride 200mg/5ml",
    "strength": "200mg/5ml",
    "dosageForm": "Injection",
    "route": "IV",
    "price": 80,
    "category": "Emergency Drug",
    "code": "RX-MED-090",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Telma 40",
    "genericName": "Telmisartan",
    "saltComposition": "Telmisartan 40mg",
    "strength": "40mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 90,
    "category": "Chronic Disease",
    "code": "RX-MED-091",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Telmisartan 40",
    "genericName": "Telmisartan",
    "saltComposition": "Telmisartan 40mg",
    "strength": "40mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 45,
    "category": "Chronic Disease",
    "code": "RX-MED-092",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Amlopress 5",
    "genericName": "Amlodipine",
    "saltComposition": "Amlodipine Besylate 5mg",
    "strength": "5mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 35,
    "category": "Chronic Disease",
    "code": "RX-MED-093",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Cilacar 10",
    "genericName": "Cilnidipine",
    "saltComposition": "Cilnidipine 10mg",
    "strength": "10mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 80,
    "category": "Chronic Disease",
    "code": "RX-MED-094",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Metosartan 50",
    "genericName": "Metoprolol + Telmisartan",
    "saltComposition": "Metoprolol Succinate 50mg + Telmisartan 40mg",
    "strength": "90mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 140,
    "category": "Chronic Disease",
    "code": "RX-MED-095",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Concor 5",
    "genericName": "Bisoprolol",
    "saltComposition": "Bisoprolol Fumarate 5mg",
    "strength": "5mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 75,
    "category": "Chronic Disease",
    "code": "RX-MED-096",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Glycomet 500",
    "genericName": "Metformin",
    "saltComposition": "Metformin Hydrochloride 500mg",
    "strength": "500mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 30,
    "category": "Chronic Disease",
    "code": "RX-MED-097",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Janumet 50/500",
    "genericName": "Sitagliptin + Metformin",
    "saltComposition": "Sitagliptin 50mg + Metformin Hydrochloride 500mg",
    "strength": "550mg",
    "dosageForm": "Tablet",
    "route": "PO",
    "price": 290,
    "category": "Chronic Disease",
    "code": "RX-MED-098",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Ryzodeg FlexTouch",
    "genericName": "Insulin Aspart + Insulin Degludec",
    "saltComposition": "Insulin Degludec 70% + Insulin Aspart 30%",
    "strength": "100 U/ml",
    "dosageForm": "Injection",
    "route": "SC",
    "price": 1450,
    "category": "Chronic Disease",
    "code": "RX-MED-099",
    "minStock": 100,
    "stock": 50
  },
  {
    "brandName": "Lantus Solostar",
    "genericName": "Insulin Glargine",
    "saltComposition": "Insulin Glargine 100 IU/ml",
    "strength": "100 IU/ml",
    "dosageForm": "Injection",
    "route": "SC",
    "price": 950,
    "category": "Chronic Disease",
    "code": "RX-MED-100",
    "minStock": 100,
    "stock": 50
  }
];

// Seed to state.inventory.pharmacy for unified HIS search compatibility
(function seedStateInventory() {
  if (window.state && window.state.inventory && window.state.inventory.pharmacy) {
    const existingCodes = new Set(window.state.inventory.pharmacy.map(item => item.code));
    window.medicationCatalog.forEach(item => {
      if (!existingCodes.has(item.code)) {
        window.state.inventory.pharmacy.push(item);
      }
    });
  }
})();

// --------------------------------------------------------------------------
// 2. MEDICATION ORDERS WORKFLOW RENDERER
// --------------------------------------------------------------------------
window.renderPrescriptionWorkflow = function(container, patient) {
  // Sync state
  if (window.state && window.state.inventory && window.state.inventory.pharmacy) {
    const existingCodes = new Set(window.state.inventory.pharmacy.map(item => item.code));
    window.medicationCatalog.forEach(item => {
      if (!existingCodes.has(item.code)) {
        window.state.inventory.pharmacy.push(item);
      }
    });
  }

  // Active builder local state
  let activeCart = (patient.prescriptions || []).map(p => ({
    drug: p.drug,
    genericName: p.genericName || '',
    dose: p.dose || 'Select Dose',
    route: p.route || 'Select Route',
    freq: p.freq || 'Select Freq',
    startDate: p.startDate || '',
    duration: p.duration || '',
    instruction: p.instruction || '',
    status: p.status || 'Active'
  }));

  let selectedDrug = null;
  let editingIndex = -1;

  // Sync back helper
  function syncCartToPatient() {
    patient.prescriptions = activeCart.map(item => ({
      drug: item.drug,
      dose: item.dose,
      freq: item.freq,
      duration: item.duration,
      instruction: item.instruction,
      route: item.route,
      startDate: item.startDate,
      status: item.status,
      genericName: item.genericName
    }));

    // Trigger update in main EMR UI if exists
    const emrPrescList = document.getElementById('emr-prescription-list');
    if (emrPrescList) {
      emrPrescList.innerHTML = patient.prescriptions.filter(p => p.status !== 'Discontinued').map((p, idx) => `
        <tr style="${p.status === 'Hold' ? 'opacity:0.6;' : ''}">
          <td>
            <strong>${p.drug}</strong>
            ${p.status === 'Hold' ? '<span style="color:#d97706; font-size:0.65rem; font-weight:bold; margin-left:0.35rem;">(ON HOLD)</span>' : ''}
          </td>
          <td>${p.dose}</td>
          <td>${p.freq}</td>
          <td>${p.duration}</td>
          <td>${p.instruction || 'None'}</td>
          <td style="text-align: right;">
            <button class="btn btn-danger" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="removePrescription('${patient.uhid}', ${idx})">Remove</button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Renders the clean clinical dashboard interface (strictly based on the user screenshot design)
  container.innerHTML = `
    <style>
      .rx-orders-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        color: #334155;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        text-align: left;
        box-sizing: border-box;
        width: 100%;
        padding: 0.25rem;
      }
      .rx-panel {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
        box-sizing: border-box;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .rx-panel-title {
        font-weight: 700;
        font-size: 1.1rem;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 0.75rem;
      }
      .rx-title-icon {
        color: #005f87;
        font-size: 1.2rem;
        font-weight: 400;
        transform: rotate(-45deg);
        display: inline-block;
      }
      .rx-search-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .rx-search-input-container {
        position: relative;
        width: 100%;
      }
      .rx-search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
        font-size: 1rem;
      }
      .rx-search-input {
        width: 100%;
        height: 38px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 0.5rem 0.5rem 0.5rem 2.25rem;
        font-size: 0.85rem;
        box-sizing: border-box;
        color: #1e293b;
        background-color: #f8fafc;
        transition: all 0.15s;
      }
      .rx-search-input:focus {
        border-color: #005f87;
        background-color: #ffffff;
        outline: none;
        box-shadow: 0 0 0 2px rgba(0, 95, 135, 0.15);
      }
      .rx-search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        max-height: 180px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        margin-top: 0.25rem;
      }
      .rx-search-item {
        padding: 0.55rem 0.75rem;
        cursor: pointer;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.78rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .rx-search-item:hover {
        background: #f0f9ff;
      }
      .rx-quick-access {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        z-index: 1001;
        display: none;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0.45rem;
        box-sizing: border-box;
        max-height: 220px;
        overflow-y: auto;
        margin-top: 0.25rem;
      }
      .rx-quick-chip {
        padding: 0.4rem 0.6rem;
        font-size: 0.78rem;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        cursor: pointer;
        text-align: left;
        color: #334155;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: all 0.15s;
      }
      .rx-quick-chip:hover {
        background: #f0f9ff;
        border-color: #005f87;
        color: #005f87;
      }
      .rx-order-form {
        display: flex;
        flex-direction: column;
        gap: 0.95rem;
      }
      .rx-form-row {
        display: flex;
        gap: 1rem;
      }
      .rx-form-row > div {
        flex: 1;
      }
      .rx-field-label {
        font-size: 0.76rem;
        font-weight: 700;
        color: #475569;
        margin-bottom: 0.35rem;
        display: block;
      }
      .rx-select, .rx-input, .rx-textarea {
        width: 100%;
        height: 38px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 0.5rem;
        font-size: 0.82rem;
        background-color: #f8fafc;
        box-sizing: border-box;
        color: #1e293b;
        transition: all 0.15s;
      }
      .rx-select:focus, .rx-input:focus, .rx-textarea:focus {
        border-color: #005f87;
        background-color: #ffffff;
        outline: none;
        box-shadow: 0 0 0 2px rgba(0, 95, 135, 0.15);
      }
      .rx-select:disabled, .rx-input:disabled, .rx-textarea:disabled {
        background-color: #f1f5f9;
        color: #94a3b8;
        cursor: not-allowed;
        border-color: #e2e8f0;
      }
      .rx-textarea {
        height: 80px;
        resize: none;
      }
      .rx-inline-alerts {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .rx-alert-card {
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.76rem;
        line-height: 1.4;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .rx-alert-danger {
        background: #fef2f2;
        border: 1px solid #fca5a5;
        color: #991b1b;
      }
      .rx-alert-warning {
        background: #fffbeb;
        border: 1px solid #fde68a;
        color: #92400e;
      }
      .rx-alternatives-card {
        padding: 0.65rem;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .rx-alt-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #ffffff;
        padding: 0.35rem 0.5rem;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        font-size: 0.74rem;
      }
      .rx-button-row {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
        gap: 1rem;
      }
      .rx-btn {
        font-size: 0.82rem;
        font-weight: 700;
        padding: 0.55rem 1.5rem;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.15s;
        box-sizing: border-box;
      }
      .rx-btn-clear {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #334155;
      }
      .rx-btn-clear:hover:not(:disabled) {
        background: #f8fafc;
        border-color: #94a3b8;
      }
      .rx-btn-submit {
        background: #005f87;
        border: none;
        color: #ffffff;
      }
      .rx-btn-submit:hover:not(:disabled) {
        background: #004c6d;
      }
      .rx-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .rx-orders-list-wrapper {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #ffffff;
        overflow-y: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        max-height: 400px;
        min-height: 200px;
      }
      .rx-active-order-card {
        padding: 0.85rem 0.75rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        transition: background 0.15s ease;
      }
      .rx-active-order-card:last-child {
        border-bottom: none;
      }
      .rx-active-order-card:hover {
        background: #f8fafc;
      }
      .rx-info-tag {
        background: #f1f5f9;
        color: #334155;
        padding: 0.25rem 0.5rem;
        font-size: 0.72rem;
        border-radius: 4px;
        font-weight: 500;
        display: inline-block;
      }
      .rx-status-badge {
        display: inline-block;
        padding: 0.25rem 0.65rem;
        font-size: 0.72rem;
        font-weight: 700;
        border-radius: 12px;
        text-align: center;
      }
      .rx-badge-active {
        background: #e0f2fe;
        color: #0369a1;
      }
      .rx-badge-hold {
        background: #fef3c7;
        color: #b45309;
      }
      .rx-badge-discontinued {
        background: #f1f5f9;
        color: #475569;
      }
      .rx-action-link {
        color: #005f87;
        text-decoration: none;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.68rem;
      }
      .rx-action-link:hover {
        text-decoration: underline;
      }
    </style>

    <div class="rx-orders-container">
      <!-- LEFT PANEL: SEARCH & ORDER ENTRY -->
      <div class="rx-panel">
        <div class="rx-panel-title">
          <span class="rx-title-icon">💊</span> Medication Search & Order Entry
        </div>

        <div class="rx-order-form">
          <!-- Search input -->
          <div class="rx-search-wrapper">
            <label class="rx-field-label">Search Medication</label>
            <div class="rx-search-input-container">
              <span class="rx-search-icon">🔍</span>
              <input type="text" id="rx-search-input" class="rx-search-input" placeholder="e.g., Paracetamol" autocomplete="off">
            </div>
            <div id="rx-search-results" class="rx-search-results"></div>

            <!-- Quick Access overlay dropdown -->
            <div class="rx-quick-access" id="rx-quick-access-panel" style="display: none;">
              <div id="rx-freq-list" style="display:flex; flex-direction:column; gap:0.2rem;"></div>
              <div id="rx-recent-list" style="display:flex; flex-direction:column; gap:0.2rem;"></div>
            </div>
          </div>

          <!-- CDSS inline warnings -->
          <div class="rx-inline-alerts" id="rx-inline-alerts-container" style="display:none;"></div>

          <!-- Alternate suggestions drawer -->
          <div class="rx-alternatives-card" id="rx-alternatives-container" style="display:none;"></div>

          <!-- Selected Med Display (Hidden or clean subtext) -->
          <div class="rx-form-group-full" style="padding: 0.5rem; background: #f8fafc; border-radius: 6px; border: 1px dashed #cbd5e1; font-weight:600; font-size:0.78rem; color:#475569; display:none;" id="rx-selected-med-display"></div>

          <!-- Dose & Route -->
          <div class="rx-form-row">
            <div>
              <label class="rx-field-label">Dose</label>
              <select id="rx-input-dose" class="rx-select" disabled>
                <option value="Select Dose" disabled selected>Select Dose</option>
                <option value="500 mg">500 mg</option>
                <option value="650 mg">650 mg</option>
                <option value="40 mg">40 mg</option>
                <option value="10 mg">10 mg</option>
                <option value="1 tablet">1 tablet</option>
                <option value="2 tablets">2 tablets</option>
                <option value="1 capsule">1 capsule</option>
                <option value="1 vial">1 vial</option>
                <option value="2 puffs">2 puffs</option>
              </select>
            </div>

            <div>
              <label class="rx-field-label">Route</label>
              <select id="rx-select-route" class="rx-select" disabled>
                <option value="Select Route" disabled selected>Select Route</option>
                <option value="PO">PO</option>
                <option value="IV">IV</option>
                <option value="IM">IM</option>
                <option value="SC">SC</option>
                <option value="SL">SL</option>
                <option value="PR">PR</option>
                <option value="INH">INH</option>
                <option value="TOP">TOP</option>
              </select>
            </div>
          </div>

          <!-- Frequency & Duration -->
          <div class="rx-form-row">
            <div>
              <label class="rx-field-label">Frequency</label>
              <select id="rx-select-freq" class="rx-select" disabled>
                <option value="Select Freq" disabled selected>Select Freq</option>
                <option value="Q6H PRN">Q6H PRN</option>
                <option value="Daily">Daily</option>
                <option value="BID">BID</option>
                <option value="TID">TID</option>
                <option value="QID">QID</option>
                <option value="Q4H">Q4H</option>
                <option value="Q8H">Q8H</option>
                <option value="QW">QW</option>
              </select>
            </div>

            <div>
              <label class="rx-field-label">Duration (Days)</label>
              <input type="text" id="rx-input-duration" class="rx-input" placeholder="e.g., 7" disabled>
            </div>
          </div>

          <!-- Start Date & Time -->
          <div>
            <label class="rx-field-label">Start Date & Time</label>
            <input type="datetime-local" id="rx-input-startdate" class="rx-input" disabled>
          </div>

          <!-- Instructions -->
          <div>
            <label class="rx-field-label">Instructions</label>
            <textarea id="rx-input-instructions" class="rx-textarea" placeholder="Enter specific dosage instructions..." disabled></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="rx-button-row">
            <button class="rx-btn rx-btn-clear" id="rx-btn-clear" disabled>Clear Form</button>
            <button class="rx-btn rx-btn-submit" id="rx-btn-submit" disabled>Add Order</button>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: ACTIVE MEDICATION ORDERS -->
      <div class="rx-panel">


        <div class="rx-orders-list-wrapper" id="rx-active-orders-list"></div>

        <div style="display: flex; gap: 0.5rem; margin-top: auto;">
          <button class="btn btn-secondary" id="rx-btn-preview" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0.55rem; font-size: 0.85rem; font-weight:700; border-radius: 8px; height: auto;">
            👁️ Preview
          </button>
          <button class="btn btn-secondary" id="rx-btn-print" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0.55rem; font-size: 0.85rem; font-weight:700; border-radius: 8px; height: auto;">
            🏁 End Consultation
          </button>
          <button class="btn btn-primary" id="rx-btn-finalize" style="flex: 2; display: flex; align-items: center; justify-content: center; padding: 0.55rem; font-size: 0.85rem; font-weight:700; border-radius: 8px; background-color: #005f87; border: none; height: auto;">
            💾 Save Orders
          </button>
        </div>
      </div>
    </div>
  `;

  // UI caches
  const searchInput = document.getElementById('rx-search-input');
  const searchResults = document.getElementById('rx-search-results');
  const btnSubmit = document.getElementById('rx-btn-submit');
  const btnClear = document.getElementById('rx-btn-clear');
  const btnFinalize = document.getElementById('rx-btn-finalize');
  const btnPreview = document.getElementById('rx-btn-preview');
  const btnPrint = document.getElementById('rx-btn-print');

  const inputDose = document.getElementById('rx-input-dose');
  const selectRoute = document.getElementById('rx-select-route');
  const selectFreq = document.getElementById('rx-select-freq');
  const inputDuration = document.getElementById('rx-input-duration');
  const inputStartDate = document.getElementById('rx-input-startdate');
  const inputInstructions = document.getElementById('rx-input-instructions');
  const medDisplay = document.getElementById('rx-selected-med-display');

  // Initialize start date
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
  inputStartDate.value = localISOTime;

  // Quick access lists
  const freqList = [
    { brandName: "Dolo 650", code: "RX-MED-001" },
    { brandName: "Augmentin 625 DUO", code: "RX-MED-012" },
    { brandName: "Pantocid 40", code: "RX-MED-031" },
    { brandName: "Monocef 1g", code: "RX-MED-016" },
    { brandName: "Lasix 40", code: "RX-MED-065" }
  ];

  const recentList = [
    { brandName: "Zofran 4", code: "RX-MED-036" },
    { brandName: "Telma 40", code: "RX-MED-052" },
    { brandName: "Glycomet 500", code: "RX-MED-041" },
    { brandName: "Tazact 4.5g", code: "RX-MED-019" },
    { brandName: "Clexane 40mg Inj", code: "RX-MED-087" }
  ];

  function renderQuickAccess() {
    const fContainer = document.getElementById('rx-freq-list');
    const rContainer = document.getElementById('rx-recent-list');
    if (!fContainer || !rContainer) return;

    fContainer.innerHTML = freqList.map(m => {
      const match = window.state.inventory.pharmacy.find(d => d.brandName.toLowerCase() === m.brandName.toLowerCase()) || m;
      return `<button class="rx-quick-chip" onclick="window.selectDrugForBuilder('${match.code}')" title="${match.brandName}">${match.brandName}</button>`;
    }).join('');

    rContainer.innerHTML = recentList.map(m => {
      const match = window.state.inventory.pharmacy.find(d => d.brandName.toLowerCase() === m.brandName.toLowerCase()) || m;
      return `<button class="rx-quick-chip" onclick="window.selectDrugForBuilder('${match.code}')" title="${match.brandName}">${match.brandName}</button>`;
    }).join('');
  }

  function getFrequencyText(freqStr) {
    if (!freqStr) return '';
    const isPRN = freqStr.includes('PRN');
    let cleanFreq = freqStr.replace(/\(PRN\)/g, '').trim();
    
    const mapping = {
      'TID': 'Thrice daily (TID)',
      'BID': 'Twice daily (BID)',
      'Daily': 'Once daily (Daily)',
      'QID': 'Four times daily (QID)',
      'Q6H PRN': 'Every 6 hours as needed (Q6H PRN)',
      'Q4H': 'Every 4 hours (Q4H)',
      'Q8H': 'Every 8 hours (Q8H)',
      'QW': 'Once weekly (QW)'
    };
    
    let mapped = mapping[cleanFreq] || mapping[freqStr] || freqStr;
    if (isPRN && !mapped.includes('PRN') && !mapped.includes('as needed')) {
      mapped = `${mapped} (PRN)`;
    }
    return mapped;
  }

  function getStartDateText(dateStr) {
    if (!dateStr) return 'Start Today';
    try {
      const d = new Date(dateStr);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) {
        return 'Start Today';
      }
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `Start: ${day}/${month}/${year}`;
    } catch (e) {
      return 'Start Today';
    }
  }

  // Active orders list rendering
  function renderActiveOrdersTable() {
    const listContainer = document.getElementById('rx-active-orders-list');
    if (!listContainer) return;

    if (activeCart.length === 0) {
      listContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:2rem; font-size:0.8rem;">No active medication orders.</div>`;
      return;
    }

    listContainer.innerHTML = activeCart.map((item, idx) => {
      // Dosage form details
      const drugDetails = window.state.inventory.pharmacy.find(d => d.brandName.toLowerCase() === item.drug.toLowerCase());
      const subForm = drugDetails ? drugDetails.dosageForm : 'Tablet';
      
      // Clean brand name to remove strength
      let cleanBrand = item.drug;
      if (drugDetails && drugDetails.strength) {
        const digitsMatch = drugDetails.strength.match(/\d+/);
        if (digitsMatch) {
          cleanBrand = cleanBrand.replace(new RegExp('\\b' + digitsMatch[0] + '\\b', 'g'), '');
        }
        cleanBrand = cleanBrand.replace(new RegExp('\\b' + drugDetails.strength + '\\b', 'gi'), '');
        cleanBrand = cleanBrand.replace(/\s+/g, ' ').trim();
      }

      // Title formatting
      const displayTitle = drugDetails 
        ? `${drugDetails.genericName} ${drugDetails.strength} (${cleanBrand})`
        : `${item.genericName || ''} (${item.drug})`;

      // Map dose to tab/cap/etc.
      let mappedDose = item.dose;
      if (mappedDose === '1 tablet') mappedDose = '1 tab';
      else if (mappedDose === '2 tablets') mappedDose = '2 tabs';
      else if (mappedDose === '1 capsule') mappedDose = '1 cap';

      // Map frequency to user-friendly text
      const frequencyDesc = getFrequencyText(item.freq);

      // Start date text
      const startDateText = getStartDateText(item.startDate);

      return `
        <div class="rx-active-order-card">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
            <strong style="color:#0f172a; font-size:0.85rem;">${displayTitle}</strong>
            <button class="btn btn-danger btn-sm" onclick="window.removeMedicationOrder(${idx})" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; font-weight: 700; border-radius: 4px; border: none; background-color: #dc2626; color: #ffffff; cursor: pointer; height: auto; line-height: 1;">Remove</button>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.15rem;">
            <span class="rx-info-tag">${subForm}</span>
            <span class="rx-info-tag">${mappedDose}</span>
            <span class="rx-info-tag">${frequencyDesc}</span>
            ${item.instruction ? `<span class="rx-info-tag">${item.instruction}</span>` : ''}
            <span class="rx-info-tag">${startDateText}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function enableFormInputs(enabled) {
    inputDose.disabled = !enabled;
    selectRoute.disabled = !enabled;
    selectFreq.disabled = !enabled;
    inputDuration.disabled = !enabled;
    inputStartDate.disabled = !enabled;
    inputInstructions.disabled = !enabled;
    btnClear.disabled = !enabled;
    btnSubmit.disabled = !enabled;
  }

  // Live search keyup handler
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      searchResults.style.display = 'none';
      document.getElementById('rx-quick-access-panel').style.display = 'grid';
      return;
    }

    document.getElementById('rx-quick-access-panel').style.display = 'none';

    const matches = window.state.inventory.pharmacy.filter(item => 
      item.brandName.toLowerCase().includes(q) ||
      item.genericName.toLowerCase().includes(q) ||
      item.saltComposition.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      searchResults.innerHTML = `<div style="padding:0.5rem; font-size:0.75rem; color:var(--text-muted); text-align:center;">No medications found.</div>`;
    } else {
      searchResults.innerHTML = matches.slice(0, 20).map(item => {
        const isOOS = item.stock === 0;
        const statusText = isOOS 
          ? `<div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.25rem;">
              <span style="color:#dc2626; font-weight:700;">Out of Stock</span>
              <button class="btn btn-secondary btn-sm" style="padding:0.15rem 0.35rem; font-size:0.65rem; height:auto; border-radius: 4px;">See Alternative</button>
            </div>`
          : `<span style="color:#16a34a;">In Stock (${item.stock})</span>`;
        return `
          <div class="rx-search-item" onclick="window.selectDrugForBuilder('${item.code}')">
            <div>
              <strong>${item.brandName}</strong> (${item.strength} • ${item.dosageForm})
              <span style="display:block; font-size:0.68rem; color:var(--text-secondary);">${item.genericName}</span>
            </div>
            <div>${statusText}</div>
          </div>
        `;
      }).join('');
    }
    searchResults.style.display = 'block';
  });

  searchInput.addEventListener('focus', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      document.getElementById('rx-quick-access-panel').style.display = 'grid';
    }
  });

  searchInput.addEventListener('click', (e) => {
    e.stopPropagation();
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      document.getElementById('rx-quick-access-panel').style.display = 'grid';
    }
  });

  // Global click listener to close search results and quick access when clicking outside
  document.addEventListener('click', (e) => {
    const qAccess = document.getElementById('rx-quick-access-panel');
    if (!qAccess) return;
    if (!e.target.closest('.rx-search-wrapper') && !e.target.closest('.rx-quick-access')) {
      qAccess.style.display = 'none';
      searchResults.style.display = 'none';
    }
  });

  // Global selection function
  window.selectDrugForBuilder = function(code) {
    const drug = window.state.inventory.pharmacy.find(d => d.code === code);
    if (!drug) return;

    selectedDrug = drug;
    medDisplay.innerHTML = `Selected Medicine: <strong>${drug.brandName}</strong> (${drug.genericName})`;
    searchInput.value = drug.brandName;
    searchResults.style.display = 'none';
    document.getElementById('rx-quick-access-panel').style.display = 'none';

    enableFormInputs(true);

    // Pick defaults
    if (editingIndex === -1) {
      // Find exact matches for Dose/Route/Frequency dropdowns
      if (drug.strength.includes("650")) inputDose.value = "650 mg";
      else if (drug.strength.includes("500")) inputDose.value = "500 mg";
      else if (drug.strength.includes("40")) inputDose.value = "40 mg";
      else if (drug.strength.includes("10")) inputDose.value = "10 mg";
      else if (drug.dosageForm === 'Tablet') inputDose.value = "1 tablet";
      else if (drug.dosageForm === 'Capsule') inputDose.value = "1 capsule";
      else if (drug.dosageForm === 'Injection') inputDose.value = "1 vial";
      else if (drug.dosageForm === 'Inhaler') inputDose.value = "2 puffs";
      else inputDose.value = "Select Dose";

      let routeVal = "PO";
      if (drug.route) {
        const drLower = drug.route.toLowerCase();
        if (drLower.includes("oral") || drLower === "po") routeVal = "PO";
        else if (drLower.includes("intravenous") || drLower === "iv") routeVal = "IV";
        else if (drLower.includes("intramuscular") || drLower === "im") routeVal = "IM";
        else if (drLower.includes("subcutaneous") || drLower === "sc") routeVal = "SC";
        else if (drLower.includes("sublingual") || drLower === "sl") routeVal = "SL";
        else if (drLower.includes("rectal") || drLower === "pr") routeVal = "PR";
        else if (drLower.includes("inhalation") || drLower === "inh") routeVal = "INH";
        else if (drLower.includes("topical") || drLower === "top") routeVal = "TOP";
        else routeVal = drug.route;
      }
      selectRoute.value = routeVal;
      selectFreq.value = drug.genericName.toLowerCase().includes("paracetamol") ? "Q6H PRN" : "Daily";
      inputDuration.value = "5";
      inputInstructions.value = "";
    }

    btnSubmit.innerText = editingIndex > -1 ? "Update Order" : "Add Order";
    validateSafetyAlerts();
    checkAlternateSuggestions();
  };

  // One-click alternate substitution
  window.substituteSelectedMedication = function(altCode) {
    const altDrug = window.state.inventory.pharmacy.find(d => d.code === altCode);
    if (!altDrug) return;

    selectedDrug = altDrug;
    medDisplay.innerHTML = `Selected Medicine: <strong>${altDrug.brandName}</strong> (${altDrug.genericName})`;
    searchInput.value = altDrug.brandName;

    validateSafetyAlerts();
    checkAlternateSuggestions();
  };

  // Live CDSS safety warnings
  function validateSafetyAlerts() {
    const container = document.getElementById('rx-inline-alerts-container');
    if (!container || !selectedDrug) {
      if (container) container.style.display = 'none';
      return;
    }

    let html = '';

    // 1. Allergy Conflict
    const allergyText = (patient.allergies || '').toLowerCase();
    const hasAllergy = allergyText.includes(selectedDrug.brandName.toLowerCase()) ||
                      allergyText.includes(selectedDrug.genericName.toLowerCase());

    if (hasAllergy) {
      html += `
        <div class="rx-alert-card rx-alert-danger">
          <strong>🚨 ALLERGY CONFLICT:</strong> Patient is allergic to <strong>${selectedDrug.brandName}</strong> / <strong>${selectedDrug.genericName}</strong>. 
          Documented Allergies: <em>"${patient.allergies}"</em>.
        </div>
      `;
    }

    // 2. Duplicate Medication Warning
    const isDuplicate = activeCart.some((item, idx) => 
      idx !== editingIndex && 
      item.status !== 'Discontinued' && 
      item.genericName.toLowerCase() === selectedDrug.genericName.toLowerCase()
    );

    if (isDuplicate) {
      html += `
        <div class="rx-alert-card rx-alert-warning">
          <strong>⚠️ DUPLICATE MEDICATION:</strong> An active order already exists for generic <strong>${selectedDrug.genericName}</strong>.
        </div>
      `;
    }

    if (html) {
      container.innerHTML = html;
      container.style.display = 'flex';
    } else {
      container.style.display = 'none';
    }
  }

  // Alternate Suggestions (Out of Stock only)
  function checkAlternateSuggestions() {
    const container = document.getElementById('rx-alternatives-container');
    if (!container || !selectedDrug) {
      if (container) container.style.display = 'none';
      return;
    }

    if (selectedDrug.stock === 0) {
      const matches = window.state.inventory.pharmacy.filter(d => 
        d.code !== selectedDrug.code &&
        d.genericName.toLowerCase() === selectedDrug.genericName.toLowerCase() &&
        d.stock > 0
      );

      const medCardHTML = `
        <div style="background: #fff5f5; border: 1px solid #fee2e2; border-radius: 8px; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; width: 100%;">
          <div>
            <strong style="color: #991b1b; font-size: 0.85rem;">${selectedDrug.brandName}</strong>
            <span style="display: block; font-size: 0.72rem; color: #7f1d1d; margin-top: 0.15rem;">${selectedDrug.genericName} (${selectedDrug.strength} • ${selectedDrug.dosageForm})</span>
          </div>
          <span style="background: #fecaca; color: #991b1b; padding: 0.25rem 0.5rem; font-size: 0.68rem; font-weight: 700; border-radius: 4px; text-transform: uppercase;">Out of Stock</span>
        </div>
      `;

      if (matches.length > 0) {
        container.innerHTML = `
          ${medCardHTML}
          <div style="font-size: 0.75rem; font-weight: 700; color: #475569; margin: 0.25rem 0 0.15rem 0;">Select alternative medicine:</div>
          <div style="display:flex; flex-direction:column; gap:0.35rem;">
            ${matches.map(alt => `
              <div class="rx-alt-item">
                <div>
                  <strong>${alt.brandName}</strong> (${alt.strength} • ${alt.dosageForm})
                  <span style="display:block; font-size:0.65rem; color:#64748b; margin-top:0.15rem;">${alt.saltComposition}</span>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="window.substituteSelectedMedication('${alt.code}')" style="padding:0.2rem 0.5rem; font-size:0.72rem; height:auto; border-radius: 4px;">Replace</button>
              </div>
            `).join('')}
          </div>
        `;
        container.style.display = 'flex';
      } else {
        container.innerHTML = `
          ${medCardHTML}
          <div style="font-size: 0.72rem; color: #991b1b; font-weight: 700; margin-top: 0.25rem;">⚠️ No alternative medicines are available in stock.</div>
        `;
        container.style.display = 'flex';
      }
    } else {
      container.style.display = 'none';
    }
  }

  function clearBuilderForm() {
    selectedDrug = null;
    editingIndex = -1;
    medDisplay.innerHTML = "";
    searchInput.value = "";
    searchResults.style.display = 'none';
    document.getElementById('rx-quick-access-panel').style.display = 'none';

    document.getElementById('rx-inline-alerts-container').style.display = 'none';
    document.getElementById('rx-alternatives-container').style.display = 'none';

    inputDose.value = "Select Dose";
    selectRoute.value = "Select Route";
    selectFreq.value = "Select Freq";
    inputDuration.value = "";
    inputStartDate.value = localISOTime;
    inputInstructions.value = "";

    enableFormInputs(false);
    btnSubmit.innerText = "Add Order";
  }

  // Clear Form handler
  btnClear.addEventListener('click', () => {
    clearBuilderForm();
  });

  // Submit Order handler (Add/Update)
  btnSubmit.addEventListener('click', () => {
    if (!selectedDrug) {
      alert("Please select a medicine first.");
      return;
    }

    const dose = inputDose.value;
    const route = selectRoute.value;
    const freq = selectFreq.value;
    const duration = inputDuration.value.trim();
    const startDate = inputStartDate.value;
    const instruction = inputInstructions.value.trim();

    if (!dose || dose === "Select Dose") {
      alert("Please select a valid Dose.");
      return;
    }
    if (!route || route === "Select Route") {
      alert("Please select a valid Route.");
      return;
    }
    if (!freq || freq === "Select Freq") {
      alert("Please select a valid Frequency.");
      return;
    }
    if (!duration) {
      alert("Duration is a required field.");
      return;
    }

    const order = {
      drug: selectedDrug.brandName,
      genericName: selectedDrug.genericName,
      dose,
      route,
      freq,
      startDate,
      duration: duration.toLowerCase().includes("day") ? duration : `${duration} Days`,
      instruction,
      status: 'Active'
    };

    if (editingIndex > -1) {
      order.status = activeCart[editingIndex].status || 'Active';
      activeCart[editingIndex] = order;
      alert("Medication order updated.");
    } else {
      activeCart.push(order);
      alert("Medication order added.");
    }

    syncCartToPatient();
    renderActiveOrdersTable();
    clearBuilderForm();
  });

  // Row operations
  window.editMedicationOrder = function(idx) {
    const item = activeCart[idx];
    if (!item) return;

    editingIndex = idx;
    
    // Find the drug in pharmacy catalog
    const drug = window.state.inventory.pharmacy.find(d => d.brandName.toLowerCase() === item.drug.toLowerCase());
    if (drug) {
      selectedDrug = drug;
      medDisplay.innerHTML = `Editing: <strong>${drug.brandName}</strong> (${drug.genericName})`;
      searchInput.value = drug.brandName;
    } else {
      // Mock selected drug
      selectedDrug = {
        code: "RX-MOCK",
        brandName: item.drug,
        genericName: item.genericName || item.drug,
        stock: 50,
        dosageForm: "Tablet",
        strength: item.dose,
        route: item.route
      };
      medDisplay.innerHTML = `Editing: <strong>${item.drug}</strong>`;
      searchInput.value = item.drug;
    }

    enableFormInputs(true);
    inputDose.value = item.dose;
    selectRoute.value = item.route || "PO";
    selectFreq.value = item.freq;
    inputDuration.value = item.duration.replace(" Days", "").replace(" days", "");
    inputStartDate.value = item.startDate || localISOTime;
    inputInstructions.value = item.instruction || "";

    btnSubmit.innerText = "Update Order";
    validateSafetyAlerts();
    checkAlternateSuggestions();
  };

  window.removeMedicationOrder = function(idx) {
    if (activeCart[idx]) {
      const item = activeCart[idx];
      if (confirm(`Are you sure you want to remove the medication order for "${item.drug}"?`)) {
        activeCart.splice(idx, 1);
        syncCartToPatient();
        renderActiveOrdersTable();
        validateSafetyAlerts();
      }
    }
  };

  window.removePrescription = function(uhid, idx) {
    const pat = (window.state.patients || []).find(p => p.uhid === uhid);
    if (pat && pat.prescriptions) {
      const activePrescs = pat.prescriptions.filter(p => p.status !== 'Discontinued');
      const targetPresc = activePrescs[idx];
      if (targetPresc) {
        const masterIdx = pat.prescriptions.indexOf(targetPresc);
        if (masterIdx > -1) {
          if (confirm(`Are you sure you want to remove prescription for "${targetPresc.drug}"?`)) {
            pat.prescriptions.splice(masterIdx, 1);
            localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
            alert("Prescription removed successfully.");
            if (window.views.patients) {
              const container = document.getElementById('main-content');
              if (container) {
                window.views.patients(container, '', { uhid: uhid });
              }
            }
          }
        }
      }
    }
  };

  // Save & Finalize handler
  btnFinalize.addEventListener('click', () => {
    if (activeCart.length === 0) {
      alert("Medication orders list is empty. Cannot finalize.");
      return;
    }

    // Add EMR timeline log
    const todayStr = new Date().toLocaleDateString('en-CA');
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '💊',
      title: 'Medication Prescribed',
      desc: `Orders: ${activeCart.map(c => `${c.drug} [${c.status}]`).join(', ')}.`
    });

    // Write audit log
    window.state.auditLogs = window.state.auditLogs || [];
    window.state.auditLogs.push({
      timestamp: new Date().toISOString(),
      user: window.state.activeUserRole || "Doctor",
      uhid: patient.uhid,
      patientName: patient.name,
      action: "Finalized IPD Medication Orders",
      medsCount: activeCart.length
    });

    // Set status to Completed if they are an OPD patient in EMR
    if (patient.type === 'OPD' && (patient.status === 'Checked In' || patient.status === 'Registered')) {
      patient.status = 'Completed';
      alert("Medication orders successfully saved and synchronized!");
      if (window.router) {
        window.router.navigate('emr');
      } else {
        window.history.back();
      }
    } else {
      alert("Medication orders successfully saved and synchronized!");
      if (window.closeActionModal) {
        window.closeActionModal();
      }
    }
  });

  function generatePrescriptionHTML() {
    if (activeCart.length === 0) return "<p>No active prescriptions.</p>";
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; border: 1px solid #ccc; background: #fff;">
        <div style="text-align: center; border-bottom: 2px solid #005f87; padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <h1 style="color: #005f87; margin: 0;">Saronil Hospital & Research Centre</h1>
          <p style="margin: 0.25rem 0; color: #555;">123 Healthcare Avenue, Medical District</p>
          <p style="margin: 0; color: #555;">Phone: +91 98765 43210 | Email: care@saronil.com</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-size: 0.9rem;">
          <div>
            <strong>Patient Name:</strong> ${patient.name}<br>
            <strong>UHID:</strong> ${patient.uhid}<br>
            <strong>Age/Sex:</strong> ${patient.age} / ${patient.gender}<br>
            <strong>Consultant:</strong> ${patient.primaryConsultant}
          </div>
          <div style="text-align: right;">
            <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
            <strong>Time:</strong> ${new Date().toLocaleTimeString()}<br>
            <strong>Department:</strong> ${patient.department}
          </div>
        </div>

        <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px; font-size: 0.85rem;">
          <h4 style="margin-top: 0; margin-bottom: 0.5rem;">Clinical Notes & Vitals</h4>
          <div style="display: flex; gap: 1.5rem;">
            <span><strong>BP:</strong> ${patient.vitals?.bp || '--'}</span>
            <span><strong>Pulse:</strong> ${patient.vitals?.hr || '--'} bpm</span>
            <span><strong>Temp:</strong> ${patient.vitals?.temp || '--'} °F</span>
            <span><strong>Wt:</strong> ${patient.vitals?.weight || '--'} kg</span>
          </div>
        </div>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 1rem;">Rx</h3>
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 0.5rem; border-bottom: 1px solid #cbd5e1;">Medicine</th>
              <th style="padding: 0.5rem; border-bottom: 1px solid #cbd5e1;">Dose</th>
              <th style="padding: 0.5rem; border-bottom: 1px solid #cbd5e1;">Route</th>
              <th style="padding: 0.5rem; border-bottom: 1px solid #cbd5e1;">Freq</th>
              <th style="padding: 0.5rem; border-bottom: 1px solid #cbd5e1;">Duration</th>
              <th style="padding: 0.5rem; border-bottom: 1px solid #cbd5e1;">Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${activeCart.map(item => `
              <tr>
                <td style="padding: 0.75rem 0.5rem; border-bottom: 1px solid #eee;"><strong>${item.drug}</strong><br><span style="font-size:0.75rem; color:#666;">${item.genericName}</span></td>
                <td style="padding: 0.75rem 0.5rem; border-bottom: 1px solid #eee;">${item.dose}</td>
                <td style="padding: 0.75rem 0.5rem; border-bottom: 1px solid #eee;">${item.route}</td>
                <td style="padding: 0.75rem 0.5rem; border-bottom: 1px solid #eee;">${item.freq}</td>
                <td style="padding: 0.75rem 0.5rem; border-bottom: 1px solid #eee;">${item.duration}</td>
                <td style="padding: 0.75rem 0.5rem; border-bottom: 1px solid #eee;">${item.instruction || '--'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 4rem; display: flex; justify-content: space-between; font-size: 0.9rem;">
          <div>
            <br>
            <p style="margin: 0; font-size: 0.8rem; color: #666;">Valid only for 14 days from issue date.</p>
          </div>
          <div style="text-align: center;">
            <div style="width: 150px; border-bottom: 1px solid #000; margin-bottom: 0.5rem;"></div>
            <strong>${patient.primaryConsultant}</strong><br>
            <span style="font-size: 0.8rem; color: #555;">Signature & Stamp</span>
          </div>
        </div>
      </div>
    `;
  }

  btnPreview.addEventListener('click', () => {
    if (activeCart.length === 0) {
      alert("No medications to preview.");
      return;
    }
    
    let modal = document.getElementById('rx-preview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rx-preview-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-box" style="max-width: 850px; width: 95%; max-height: 90vh; display: flex; flex-direction: column;">
          <div class="modal-header">
            <h4 class="modal-title">Prescription Preview</h4>
            <span class="modal-close" onclick="document.getElementById('rx-preview-modal').style.display='none'">&times;</span>
          </div>
          <div class="modal-body" style="overflow-y: auto; padding: 1rem; flex: 1; background: #e2e8f0; display: flex; justify-content: center;">
            <div id="rx-preview-content" style="width: 100%;"></div>
          </div>
          <div style="padding: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 0.5rem; background: #fff;">
            <button class="btn btn-secondary" onclick="document.getElementById('rx-preview-modal').style.display='none'">Close</button>
            <button class="btn btn-primary" onclick="document.getElementById('rx-btn-print').click(); document.getElementById('rx-preview-modal').style.display='none';">🖨️ Print</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    document.getElementById('rx-preview-content').innerHTML = generatePrescriptionHTML();
    modal.classList.add('active');
    modal.style.display = 'flex';
  });

  function generateDetailedConsultationHTML() {
    const rxDate = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
    const diagnosis = patient.clinicalData?.diagnosis || 'Major depressive disorder, single episode, moderate';
    const icdCode = patient.clinicalData?.icdCode || 'ICD-11: 6A70.1';
    const complaint = patient.clinicalData?.complaint || 'Depressed mood, poor sleep, anhedonia';
    const hpi = patient.clinicalData?.hpi || 'Patient reports persistent low mood, early morning awakening, loss of interest in previously enjoyable activities. Difficulty concentrating at work. No energy. Some passive suicidal ideation (wishing not to wake up) but no plan or intent.';
    
    return `
      <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 4px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px;">
          <div>
            <h2 style="color: #4f46e5; margin: 0; font-size: 1.4rem; font-weight: 800;">Saronil Health Clinic</h2>
            <div style="font-size: 0.9rem; font-weight: 700; color: #334155; margin-top: 4px;">${patient.primaryConsultant || 'Dr. Riya Sharma'}, MD Psychiatry</div>
            <div style="font-size: 0.75rem; color: #64748b;">Reg No. MH-2019-4521 · Bengaluru</div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.75rem; color: #64748b; font-weight: 700;">Prescription Date</span><br>
            <strong style="font-size: 1.1rem; color: #0f172a;">${rxDate}</strong>
          </div>
        </div>

        <!-- Patient details box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div>
            <div style="margin-bottom: 4px;"><span style="color:#64748b; font-size:0.8rem;">Patient:</span> <strong style="color:#0f172a; font-size:0.95rem;">${patient.name}</strong></div>
            <div style="margin-bottom: 4px;"><span style="color:#64748b; font-size:0.8rem;">Age/Gender:</span> <strong style="color:#0f172a; font-size:0.9rem;">${patient.age} yrs / ${patient.gender}</strong></div>
            <div><span style="color:#64748b; font-size:0.8rem;">UHID:</span> <strong style="color:#4f46e5; font-family: monospace; font-size:0.9rem;">${patient.uhid}</strong></div>
          </div>
          <div style="border-left: 1px solid #e2e8f0; padding-left: 16px;">
            <div style="color:#64748b; font-size:0.8rem; margin-bottom: 2px;">Diagnosis:</div>
            <strong style="color:#0f172a; font-size:0.95rem; display:block; margin-bottom:4px;">${diagnosis}</strong>
            <span style="color:#64748b; font-size:0.75rem; font-weight:700;">${icdCode}</span>
          </div>
        </div>

        <!-- 1. CLINICAL HISTORY -->
        <div style="margin-bottom: 20px;">
          <h4 style="color: #3538cd; font-size: 0.9rem; font-weight: 800; text-transform: uppercase; margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">1. CLINICAL HISTORY & COMPLAINTS</h4>
          
          <div style="margin-bottom: 10px; font-size: 0.85rem;"><strong style="color:#334155;">Chief Complaint:</strong> <span style="color:#0f172a;">${complaint}</span></div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 24px; font-size: 0.8rem; background: #fafafa; padding: 10px; border-radius: 6px; border: 1px dashed #e2e8f0; margin-bottom: 12px;">
            <div><span style="color:#64748b;">Onset:</span> <strong style="color:#334155;">Gradual</strong></div>
            <div><span style="color:#64748b;">Duration:</span> <strong style="color:#334155;">3 months</strong></div>
            <div><span style="color:#64748b;">Progression:</span> <strong style="color:#334155;">Worsening</strong></div>
            <div><span style="color:#64748b;">Functional Impact:</span> <strong style="color:#334155;">Significant</strong></div>
            <div style="grid-column: span 2;"><span style="color:#64748b;">Triggers:</span> <strong style="color:#334155;">Job loss, relationship stress</strong></div>
          </div>
          
          <div style="font-size: 0.85rem; background: #fff; border-left: 3px solid #cbd5e1; padding-left: 10px; margin-top: 8px;">
            <strong style="color:#334155; display:block; font-size:0.8rem; margin-bottom:4px;">HPI Narrative:</strong>
            <span style="color:#334155; font-style: italic;">"${hpi}"</span>
          </div>
        </div>

        <!-- 2. MENTAL STATE EXAMINATION -->
        <div style="margin-bottom: 20px;">
          <h4 style="color: #3538cd; font-size: 0.9rem; font-weight: 800; text-transform: uppercase; margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">2. MENTAL STATE EXAMINATION (MSE)</h4>
          <p style="margin: 0; font-size: 0.85rem; color: #475569;">
            General appearance: Co-operative but poor eye contact, disheveled appearance. Speech: Low tone and volume. Mood: Depressed. Affect: Restricted. Thought: Depressive themes. Perception: Intact. Cognition: Intact.
          </p>
        </div>

        <!-- 3. RX MEDICATIONS -->
        <div>
          <h4 style="color: #3538cd; font-size: 0.9rem; font-weight: 800; text-transform: uppercase; margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">3. Rx (Prescribed Medications)</h4>
          ${activeCart.length === 0 ? `
            <p style="margin: 0; font-size: 0.85rem; color: #64748b; font-style: italic;">No medications prescribed.</p>
          ` : `
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                  <th style="padding: 6px 8px; color: #475569; font-weight:700;">Medicine</th>
                  <th style="padding: 6px 8px; color: #475569; font-weight:700;">Dose</th>
                  <th style="padding: 6px 8px; color: #475569; font-weight:700;">Route</th>
                  <th style="padding: 6px 8px; color: #475569; font-weight:700;">Freq</th>
                  <th style="padding: 6px 8px; color: #475569; font-weight:700;">Duration</th>
                  <th style="padding: 6px 8px; color: #475569; font-weight:700;">Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${activeCart.map(item => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px; color: #0f172a;"><strong>${item.drug}</strong><br><span style="font-size:0.75rem; color:#64748b;">${item.genericName}</span></td>
                    <td style="padding: 8px; color: #334155;">${item.dose}</td>
                    <td style="padding: 8px; color: #334155;">${item.route}</td>
                    <td style="padding: 8px; color: #334155;">${item.freq}</td>
                    <td style="padding: 8px; color: #334155;">${item.duration}</td>
                    <td style="padding: 8px; color: #475569; font-style: italic; font-size:0.8rem;">${item.instruction || 'None'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;
  }

  btnPrint.addEventListener('click', () => {
    // Show End Consultation Modal
    let modal = document.getElementById('end-consultation-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'end-consultation-modal';
      modal.className = 'modal-overlay';
      modal.style.cssText = "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.6); z-index:9999; align-items:center; justify-content:center; padding:16px;";
      modal.innerHTML = `
        <div class="modal-box" style="width:100%; max-width:1050px; height: 90vh; max-height:800px; background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.2); display:flex; flex-direction:column; overflow:hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-bottom:1px solid #e2e8f0; background:#fff;">
            <h3 style="margin:0; font-size:1.15rem; font-weight:700; color:#0f172a; font-family: sans-serif;">Finish Consultation</h3>
            <span style="cursor:pointer; font-size:1.5rem; color:#64748b; line-height:1; font-weight: bold;" onclick="document.getElementById('end-consultation-modal').style.display='none'">&times;</span>
          </div>
          <div style="display:flex; flex:1; overflow:hidden; background:#f8fafc; padding:24px; gap:24px;">
            <!-- Left Column (Actions) -->
            <div style="width: 280px; flex: 0 0 280px; display:flex; flex-direction:column; gap:16px;">
              <div style="font-size:0.75rem; font-weight:700; color:#64748b; letter-spacing:0.05em; margin-bottom:4px; font-family:sans-serif;">ACTIONS</div>
              
              <button class="btn" id="modal-rx-send-btn" style="background:#4f46e5; color:#fff; border:none; padding:12px 16px; border-radius:8px; font-weight:600; font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; width:100%;">
                ✉️ Send Prescription to Patient
              </button>
              
              <button class="btn" id="modal-rx-print-btn" style="background:#fff; color:#0f172a; border:1px solid #cbd5e1; padding:12px 16px; border-radius:8px; font-weight:600; font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; width:100%;">
                🖨️ Print Prescription
              </button>
              
              <button class="btn" id="modal-rx-confirm-btn" style="background:#0d9488; color:#fff; border:none; padding:12px 16px; border-radius:8px; font-weight:700; font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; width:100%; margin-top:auto; box-shadow:0 2px 4px rgba(13, 148, 136, 0.2);">
                ✅ Confirm Finish Consultation
              </button>
            </div>
            
            <!-- Right Column (Prescription Preview Card) -->
            <div style="flex:1; overflow-y:auto; background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <div id="modal-rx-preview-content"></div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Attach button events
      document.getElementById('modal-rx-send-btn').addEventListener('click', () => {
        alert("Success!\nPrescription sent successfully to patient's registered email address and mobile phone via secure SMS.");
      });

      document.getElementById('modal-rx-print-btn').addEventListener('click', () => {
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        printWindow.document.write(`
          <html>
            <head>
              <title>Prescription - ${patient.name}</title>
              <style>
                body { margin: 0; padding: 20px; background: #fff; font-family: Arial, sans-serif; }
                @media print {
                  body { -webkit-print-color-adjust: exact; padding: 0; }
                }
              </style>
            </head>
            <body>
              ${generateDetailedConsultationHTML()}
              <script>
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      });

      document.getElementById('modal-rx-confirm-btn').addEventListener('click', () => {
        document.getElementById('end-consultation-modal').style.display = 'none';
        // Trigger finalize saving routine
        document.getElementById('rx-btn-finalize').click();
      });
    }
    
    // Populate and show
    document.getElementById('modal-rx-preview-content').innerHTML = generateDetailedConsultationHTML();
    modal.style.display = 'flex';
  });

  // Initial runs
  renderQuickAccess();
  renderActiveOrdersTable();
  clearBuilderForm();
};
