const fs = require('fs');
const path = require('path');

const categories = {
  "General Medicine": [
    { brandName: "Calpol 500", genericName: "Paracetamol", saltComposition: "Paracetamol 500mg", strength: "500mg", dosageForm: "Tablet", route: "PO", price: 12, stockStatus: "IN" },
    { brandName: "Calpol 650", genericName: "Paracetamol", saltComposition: "Paracetamol 650mg", strength: "650mg", dosageForm: "Tablet", route: "PO", price: 14, stockStatus: "IN" },
    { brandName: "Brufen 400", genericName: "Ibuprofen", saltComposition: "Ibuprofen 400mg", strength: "400mg", dosageForm: "Tablet", route: "PO", price: 18, stockStatus: "LS" }, // LS
    { brandName: "Combiflam", genericName: "Ibuprofen + Paracetamol", saltComposition: "Ibuprofen 400mg + Paracetamol 325mg", strength: "725mg", dosageForm: "Tablet", route: "PO", price: 20, stockStatus: "IN" },
    { brandName: "Pantocid 40", genericName: "Pantoprazole", saltComposition: "Pantoprazole 40mg", strength: "40mg", dosageForm: "Tablet", route: "PO", price: 80, stockStatus: "OOS" }, // OOS
    { brandName: "Pan 40", genericName: "Pantoprazole", saltComposition: "Pantoprazole 40mg", strength: "40mg", dosageForm: "Tablet", route: "PO", price: 85, stockStatus: "IN" },
    { brandName: "Pan-D", genericName: "Pantoprazole + Domperidone", saltComposition: "Pantoprazole 40mg + Domperidone 30mg", strength: "70mg", dosageForm: "Capsule", route: "PO", price: 120, stockStatus: "IN" },
    { brandName: "Omez 20", genericName: "Omeprazole", saltComposition: "Omeprazole 20mg", strength: "20mg", dosageForm: "Capsule", route: "PO", price: 60, stockStatus: "LS" }, // LS
    { brandName: "Sompraz 40", genericName: "Esomeprazole", saltComposition: "Esomeprazole 40mg", strength: "40mg", dosageForm: "Tablet", route: "PO", price: 110, stockStatus: "IN" },
    { brandName: "Rabicip 20", genericName: "Rabeprazole", saltComposition: "Rabeprazole 20mg", strength: "20mg", dosageForm: "Tablet", route: "PO", price: 95, stockStatus: "IN" },
    { brandName: "Aciloc 150", genericName: "Ranitidine", saltComposition: "Ranitidine 150mg", strength: "150mg", dosageForm: "Tablet", route: "PO", price: 25, stockStatus: "IN" },
    { brandName: "Cremaffin Syrup", genericName: "Liquid Paraffin + Milk of Magnesia", saltComposition: "Liquid Paraffin 3.75ml + Milk of Magnesia 11.25ml", strength: "15ml", dosageForm: "Syrup", route: "PO", price: 150, stockStatus: "IN" },
    { brandName: "Duphalac", genericName: "Lactulose", saltComposition: "Lactulose 10g/15ml", strength: "10g/15ml", dosageForm: "Syrup", route: "PO", price: 220, stockStatus: "LS" }, // LS
    { brandName: "Dulcolax 5", genericName: "Bisacodyl", saltComposition: "Bisacodyl 5mg", strength: "5mg", dosageForm: "Tablet", route: "PO", price: 12, stockStatus: "IN" },
    { brandName: "Loperamide 2", genericName: "Loperamide", saltComposition: "Loperamide 2mg", strength: "2mg", dosageForm: "Capsule", route: "PO", price: 10, stockStatus: "IN" },
    { brandName: "Eldoper", genericName: "Loperamide", saltComposition: "Loperamide 2mg", strength: "2mg", dosageForm: "Capsule", route: "PO", price: 11, stockStatus: "IN" },
    { brandName: "ORS Sachet", genericName: "Oral Rehydration Salts", saltComposition: "Oral Rehydration Salts 21.8g", strength: "21.8g", dosageForm: "Powder", route: "PO", price: 22, stockStatus: "IN" },
    { brandName: "Cyclopam", genericName: "Dicyclomine + Paracetamol", saltComposition: "Dicyclomine 20mg + Paracetamol 325mg", strength: "345mg", dosageForm: "Tablet", route: "PO", price: 45, stockStatus: "IN" },
    { brandName: "Buscopan 10", genericName: "Hyoscine Butylbromide", saltComposition: "Hyoscine Butylbromide 10mg", strength: "10mg", dosageForm: "Tablet", route: "PO", price: 35, stockStatus: "IN" },
    { brandName: "Meftal-Spas", genericName: "Mefenamic Acid + Dicyclomine", saltComposition: "Mefenamic Acid 250mg + Dicyclomine 10mg", strength: "260mg", dosageForm: "Tablet", route: "PO", price: 40, stockStatus: "IN" },
    { brandName: "Febrex Plus", genericName: "Chlorpheniramine + Paracetamol + Phenylephrine", saltComposition: "Chlorpheniramine 2mg + Paracetamol 500mg + Phenylephrine 5mg", strength: "507mg", dosageForm: "Tablet", route: "PO", price: 35, stockStatus: "OOS" }, // OOS
    { brandName: "Sinarest", genericName: "Chlorpheniramine + Paracetamol + Phenylephrine", saltComposition: "Chlorpheniramine 2mg + Paracetamol 500mg + Phenylephrine 5mg", strength: "507mg", dosageForm: "Tablet", route: "PO", price: 30, stockStatus: "IN" },
    { brandName: "D-Cold Total", genericName: "Chlorpheniramine + Paracetamol + Phenylephrine", saltComposition: "Chlorpheniramine 2mg + Paracetamol 500mg + Phenylephrine 5mg", strength: "507mg", dosageForm: "Tablet", route: "PO", price: 25, stockStatus: "IN" },
    { brandName: "Wikoryl", genericName: "Chlorpheniramine + Paracetamol + Phenylephrine", saltComposition: "Chlorpheniramine 2mg + Paracetamol 500mg + Phenylephrine 5mg", strength: "507mg", dosageForm: "Tablet", route: "PO", price: 28, stockStatus: "IN" },
    { brandName: "Dolo 650", genericName: "Paracetamol", saltComposition: "Paracetamol 650mg", strength: "650mg", dosageForm: "Tablet", route: "PO", price: 15, stockStatus: "OOS" } // OOS
  ],
  "Antibiotic": [
    { brandName: "Mox 500", genericName: "Amoxicillin", saltComposition: "Amoxicillin 500mg", strength: "500mg", dosageForm: "Capsule", route: "PO", price: 70, stockStatus: "IN" },
    { brandName: "Augmentin 625 DUO", genericName: "Amoxicillin + Clavulanic Acid", saltComposition: "Amoxicillin 500mg + Clavulanic Acid 125mg", strength: "625mg", dosageForm: "Tablet", route: "PO", price: 200, stockStatus: "OOS" }, // OOS
    { brandName: "Clavam 625", genericName: "Amoxicillin + Clavulanic Acid", saltComposition: "Amoxicillin 500mg + Clavulanic Acid 125mg", strength: "625mg", dosageForm: "Tablet", route: "PO", price: 190, stockStatus: "IN" },
    { brandName: "Azithral 500", genericName: "Azithromycin", saltComposition: "Azithromycin 500mg", strength: "500mg", dosageForm: "Tablet", route: "PO", price: 120, stockStatus: "LS" }, // LS
    { brandName: "Taxim-O 200", genericName: "Cefixime", saltComposition: "Cefixime 200mg", strength: "200mg", dosageForm: "Tablet", route: "PO", price: 90, stockStatus: "IN" },
    { brandName: "Ceftum 500", genericName: "Cefuroxime", saltComposition: "Cefuroxime Axetil 500mg", strength: "500mg", dosageForm: "Tablet", route: "PO", price: 250, stockStatus: "IN" },
    { brandName: "Cefakind 500", genericName: "Cefuroxime", saltComposition: "Cefuroxime Axetil 500mg", strength: "500mg", dosageForm: "Tablet", route: "PO", price: 245, stockStatus: "IN" },
    { brandName: "Cifran 500", genericName: "Ciprofloxacin", saltComposition: "Ciprofloxacin 500mg", strength: "500mg", dosageForm: "Tablet", route: "PO", price: 40, stockStatus: "IN" },
    { brandName: "Ciplox 500", genericName: "Ciprofloxacin", saltComposition: "Ciprofloxacin 500mg", strength: "500mg", dosageForm: "Tablet", route: "PO", price: 38, stockStatus: "IN" },
    { brandName: "Loxof 500", genericName: "Levofloxacin", saltComposition: "Levofloxacin 500mg", strength: "500mg", dosageForm: "Tablet", route: "PO", price: 80, stockStatus: "LS" }, // LS
    { brandName: "Oflomac 200", genericName: "Ofloxacin", saltComposition: "Ofloxacin 200mg", strength: "200mg", dosageForm: "Tablet", route: "PO", price: 55, stockStatus: "IN" },
    { brandName: "Norflox 400", genericName: "Norfloxacin", saltComposition: "Norfloxacin 400mg", strength: "400mg", dosageForm: "Tablet", route: "PO", price: 65, stockStatus: "IN" },
    { brandName: "Metrogyl 400", genericName: "Metronidazole", saltComposition: "Metronidazole 400mg", strength: "400mg", dosageForm: "Tablet", route: "PO", price: 20, stockStatus: "IN" },
    { brandName: "Tiniba 500", genericName: "Tinidazole", saltComposition: "Tinidazole 500mg", strength: "500mg", dosageForm: "Tablet", route: "PO", price: 45, stockStatus: "IN" },
    { brandName: "Doxy-1 LDR", genericName: "Doxycycline", saltComposition: "Doxycycline 100mg", strength: "100mg", dosageForm: "Capsule", route: "PO", price: 30, stockStatus: "IN" },
    { brandName: "Minopress 100", genericName: "Minocycline", saltComposition: "Minocycline 100mg", strength: "100mg", dosageForm: "Tablet", route: "PO", price: 180, stockStatus: "IN" },
    { brandName: "Claribid 500", genericName: "Clarithromycin", saltComposition: "Clarithromycin 500mg", strength: "500mg", dosageForm: "Tablet", route: "PO", price: 380, stockStatus: "IN" },
    { brandName: "Roxy 150", genericName: "Roxithromycin", saltComposition: "Roxithromycin 150mg", strength: "150mg", dosageForm: "Tablet", route: "PO", price: 90, stockStatus: "IN" },
    { brandName: "Zifi 200", genericName: "Cefixime", saltComposition: "Cefixime 200mg", strength: "200mg", dosageForm: "Tablet", route: "PO", price: 85, stockStatus: "IN" },
    { brandName: "Podovid 200", genericName: "Cefpodoxime", saltComposition: "Cefpodoxime Proxetil 200mg", strength: "200mg", dosageForm: "Tablet", route: "PO", price: 160, stockStatus: "IN" },
    { brandName: "Monocef-O 200", genericName: "Cefpodoxime", saltComposition: "Cefpodoxime Proxetil 200mg", strength: "200mg", dosageForm: "Tablet", route: "PO", price: 155, stockStatus: "IN" },
    { brandName: "Linezolid 600", genericName: "Linezolid", saltComposition: "Linezolid 600mg", strength: "600mg", dosageForm: "Tablet", route: "PO", price: 320, stockStatus: "IN" },
    { brandName: "Lizolid 600", genericName: "Linezolid", saltComposition: "Linezolid 600mg", strength: "600mg", dosageForm: "Tablet", route: "PO", price: 310, stockStatus: "IN" },
    { brandName: "Farobact 200", genericName: "Faropenem", saltComposition: "Faropenem 200mg", strength: "200mg", dosageForm: "Tablet", route: "PO", price: 420, stockStatus: "IN" },
    { brandName: "Rifaximin 400", genericName: "Rifaximin", saltComposition: "Rifaximin 400mg", strength: "400mg", dosageForm: "Tablet", route: "PO", price: 290, stockStatus: "IN" }
  ],
  "Injection": [
    { brandName: "Monocef 1g Inj", genericName: "Ceftriaxone", saltComposition: "Ceftriaxone Sodium 1g", strength: "1g", dosageForm: "Injection", route: "IV", price: 60, stockStatus: "IN" },
    { brandName: "Taxim 1g Inj", genericName: "Cefotaxime", saltComposition: "Cefotaxime Sodium 1g", strength: "1g", dosageForm: "Injection", route: "IV", price: 40, stockStatus: "IN" },
    { brandName: "Pipzo 4.5g Inj", genericName: "Piperacillin + Tazobactam", saltComposition: "Piperacillin 4g + Tazobactam 0.5g", strength: "4.5g", dosageForm: "Injection", route: "IV", price: 450, stockStatus: "IN" },
    { brandName: "Tazact 4.5g Inj", genericName: "Piperacillin + Tazobactam", saltComposition: "Piperacillin 4g + Tazobactam 0.5g", strength: "4.5g", dosageForm: "Injection", route: "IV", price: 480, stockStatus: "IN" },
    { brandName: "Meronem 1g Inj", genericName: "Meropenem", saltComposition: "Meropenem 1g", strength: "1g", dosageForm: "Injection", route: "IV", price: 950, stockStatus: "IN" },
    { brandName: "Pantocid IV 40", genericName: "Pantoprazole", saltComposition: "Pantoprazole Sodium 40mg", strength: "40mg", dosageForm: "Injection", route: "IV", price: 50, stockStatus: "IN" },
    { brandName: "Pan IV 40", genericName: "Pantoprazole", saltComposition: "Pantoprazole Sodium 40mg", strength: "40mg", dosageForm: "Injection", route: "IV", price: 48, stockStatus: "IN" },
    { brandName: "Emset Inj 4", genericName: "Ondansetron", saltComposition: "Ondansetron 4mg/2ml", strength: "4mg/2ml", dosageForm: "Injection", route: "IV", price: 20, stockStatus: "IN" },
    { brandName: "Zofran Inj 4", genericName: "Ondansetron", saltComposition: "Ondansetron 4mg/2ml", strength: "4mg/2ml", dosageForm: "Injection", route: "IV", price: 25, stockStatus: "OOS" }, // OOS
    { brandName: "Voveran Inj 75", genericName: "Diclofenac", saltComposition: "Diclofenac Sodium 75mg/1ml", strength: "75mg/1ml", dosageForm: "Injection", route: "IM", price: 15, stockStatus: "LS" }, // LS
    { brandName: "Dynapar AQ", genericName: "Diclofenac", saltComposition: "Diclofenac Sodium 75mg/1ml", strength: "75mg/1ml", dosageForm: "Injection", route: "IM", price: 18, stockStatus: "IN" },
    { brandName: "Lasix Inj 20", genericName: "Furosemide", saltComposition: "Furosemide 20mg/2ml", strength: "20mg/2ml", dosageForm: "Injection", route: "IV", price: 12, stockStatus: "LS" }, // LS
    { brandName: "Amikacin 500 Inj", genericName: "Amikacin", saltComposition: "Amikacin 500mg", strength: "500mg", dosageForm: "Injection", route: "IV", price: 80, stockStatus: "IN" },
    { brandName: "Gentamicin 80 Inj", genericName: "Gentamicin", saltComposition: "Gentamicin 80mg", strength: "80mg", dosageForm: "Injection", route: "IV", price: 15, stockStatus: "IN" },
    { brandName: "Tramadol Inj 100", genericName: "Tramadol", saltComposition: "Tramadol 100mg/2ml", strength: "100mg/2ml", dosageForm: "Injection", route: "IV", price: 30, stockStatus: "IN" },
    { brandName: "Decadron Inj 4", genericName: "Dexamethasone", saltComposition: "Dexamethasone Sodium Phosphate 4mg/ml", strength: "4mg/ml", dosageForm: "Injection", route: "IV", price: 10, stockStatus: "IN" },
    { brandName: "Hydrocortisone 100 Inj", genericName: "Hydrocortisone", saltComposition: "Hydrocortisone Sodium Succinate 100mg", strength: "100mg", dosageForm: "Injection", route: "IV", price: 65, stockStatus: "IN" },
    { brandName: "Methylprednisolone 40 Inj", genericName: "Methylprednisolone", saltComposition: "Methylprednisolone Sodium Succinate 40mg", strength: "40mg", dosageForm: "Injection", route: "IV", price: 150, stockStatus: "IN" },
    { brandName: "Clexane 40mg Inj", genericName: "Enoxaparin", saltComposition: "Enoxaparin Sodium 40mg/0.4ml", strength: "40mg/0.4ml", dosageForm: "Injection", route: "SC", price: 420, stockStatus: "IN" },
    { brandName: "Fragmin 5000 Inj", genericName: "Dalteparin", saltComposition: "Dalteparin Sodium 5000 IU", strength: "5000 IU", dosageForm: "Injection", route: "SC", price: 380, stockStatus: "IN" }
  ],
  "IV Fluid": [
    { brandName: "Normal Saline 0.9%", genericName: "Normal Saline", saltComposition: "Sodium Chloride 0.9% w/v", strength: "500ml", dosageForm: "IV Fluid", route: "IV", price: 50, stockStatus: "IN" },
    { brandName: "Dextrose 5%", genericName: "Dextrose", saltComposition: "Dextrose 5% w/v", strength: "500ml", dosageForm: "IV Fluid", route: "IV", price: 50, stockStatus: "IN" },
    { brandName: "Dextrose Normal Saline", genericName: "Dextrose + Normal Saline", saltComposition: "Dextrose 5% + Sodium Chloride 0.9% w/v", strength: "500ml", dosageForm: "IV Fluid", route: "IV", price: 55, stockStatus: "IN" },
    { brandName: "Ringer Lactate", genericName: "Ringer Lactate", saltComposition: "Compound Sodium Lactate", strength: "500ml", dosageForm: "IV Fluid", route: "IV", price: 60, stockStatus: "LS" }, // LS
    { brandName: "Isolyte-G", genericName: "Isolyte G", saltComposition: "Multi-electrolyte with Dextrose", strength: "500ml", dosageForm: "IV Fluid", route: "IV", price: 90, stockStatus: "IN" },
    { brandName: "Isolyte-M", genericName: "Isolyte M", saltComposition: "Multi-electrolyte maintenance", strength: "500ml", dosageForm: "IV Fluid", route: "IV", price: 90, stockStatus: "IN" },
    { brandName: "Mannitol 20%", genericName: "Mannitol", saltComposition: "Mannitol 20% w/v", strength: "100ml", dosageForm: "IV Fluid", route: "IV", price: 120, stockStatus: "LS" }, // LS
    { brandName: "Normal Saline 100ml", genericName: "Normal Saline", saltComposition: "Sodium Chloride 0.9% w/v", strength: "100ml", dosageForm: "IV Fluid", route: "IV", price: 30, stockStatus: "IN" },
    { brandName: "Half Normal Saline 0.45%", genericName: "Normal Saline", saltComposition: "Sodium Chloride 0.45% w/v", strength: "500ml", dosageForm: "IV Fluid", route: "IV", price: 55, stockStatus: "IN" },
    { brandName: "Colloids / Voluven 6%", genericName: "Hydroxyethyl Starch", saltComposition: "Hydroxyethyl Starch 6% w/v", strength: "500ml", dosageForm: "IV Fluid", route: "IV", price: 650, stockStatus: "IN" }
  ],
  "Emergency Drug": [
    { brandName: "Adrenaline Inj", genericName: "Epinephrine", saltComposition: "Epinephrine 1mg/ml", strength: "1mg/ml", dosageForm: "Injection", route: "IV", price: 20, stockStatus: "IN" },
    { brandName: "Noradrenaline Inj", genericName: "Norepinephrine", saltComposition: "Norepinephrine 4mg/2ml", strength: "4mg/2ml", dosageForm: "Injection", route: "IV", price: 60, stockStatus: "IN" },
    { brandName: "Atropine Inj", genericName: "Atropine", saltComposition: "Atropine Sulfate 0.6mg/ml", strength: "0.6mg/ml", dosageForm: "Injection", route: "IV", price: 15, stockStatus: "IN" },
    { brandName: "Cordarone Inj", genericName: "Amiodarone", saltComposition: "Amiodarone Hydrochloride 150mg/3ml", strength: "150mg/3ml", dosageForm: "Injection", route: "IV", price: 90, stockStatus: "LS" }, // LS
    { brandName: "Sodium Bicarbonate 7.5%", genericName: "Sodium Bicarbonate", saltComposition: "Sodium Bicarbonate 7.5% w/v", strength: "25ml", dosageForm: "Injection", route: "IV", price: 50, stockStatus: "IN" },
    { brandName: "Calcium Gluconate 10%", genericName: "Calcium Gluconate", saltComposition: "Calcium Gluconate 10% w/v", strength: "10ml", dosageForm: "Injection", route: "IV", price: 40, stockStatus: "LS" }, // LS
    { brandName: "Mephentine Inj", genericName: "Mephentermine", saltComposition: "Mephentermine Sulfate 30mg/ml", strength: "30mg/ml", dosageForm: "Injection", route: "IV", price: 180, stockStatus: "IN" },
    { brandName: "Adenocor Inj", genericName: "Adenosine", saltComposition: "Adenosine 6mg/2ml", strength: "6mg/2ml", dosageForm: "Injection", route: "IV", price: 350, stockStatus: "IN" },
    { brandName: "Digoxin Inj 0.5", genericName: "Digoxin", saltComposition: "Digoxin 0.5mg/2ml", strength: "0.5mg/2ml", dosageForm: "Injection", route: "IV", price: 45, stockStatus: "IN" },
    { brandName: "Dopamine Inj 200", genericName: "Dopamine", saltComposition: "Dopamine Hydrochloride 200mg/5ml", strength: "200mg/5ml", dosageForm: "Injection", route: "IV", price: 80, stockStatus: "IN" }
  ],
  "Chronic Disease": [
    { brandName: "Telma 40", genericName: "Telmisartan", saltComposition: "Telmisartan 40mg", strength: "40mg", dosageForm: "Tablet", route: "PO", price: 90, stockStatus: "OOS" }, // OOS
    { brandName: "Telmisartan 40", genericName: "Telmisartan", saltComposition: "Telmisartan 40mg", strength: "40mg", dosageForm: "Tablet", route: "PO", price: 45, stockStatus: "IN" },
    { brandName: "Amlopress 5", genericName: "Amlodipine", saltComposition: "Amlodipine Besylate 5mg", strength: "5mg", dosageForm: "Tablet", route: "PO", price: 35, stockStatus: "IN" },
    { brandName: "Cilacar 10", genericName: "Cilnidipine", saltComposition: "Cilnidipine 10mg", strength: "10mg", dosageForm: "Tablet", route: "PO", price: 80, stockStatus: "IN" },
    { brandName: "Metosartan 50", genericName: "Metoprolol + Telmisartan", saltComposition: "Metoprolol Succinate 50mg + Telmisartan 40mg", strength: "90mg", dosageForm: "Tablet", route: "PO", price: 140, stockStatus: "LS" }, // LS
    { brandName: "Concor 5", genericName: "Bisoprolol", saltComposition: "Bisoprolol Fumarate 5mg", strength: "5mg", dosageForm: "Tablet", route: "PO", price: 75, stockStatus: "IN" },
    { brandName: "Glycomet 500", genericName: "Metformin", saltComposition: "Metformin Hydrochloride 500mg", strength: "500mg", dosageForm: "Tablet", route: "PO", price: 30, stockStatus: "IN" },
    { brandName: "Janumet 50/500", genericName: "Sitagliptin + Metformin", saltComposition: "Sitagliptin 50mg + Metformin Hydrochloride 500mg", strength: "550mg", dosageForm: "Tablet", route: "PO", price: 290, stockStatus: "LS" }, // LS
    { brandName: "Ryzodeg FlexTouch", genericName: "Insulin Aspart + Insulin Degludec", saltComposition: "Insulin Degludec 70% + Insulin Aspart 30%", strength: "100 U/ml", dosageForm: "Injection", route: "SC", price: 1450, stockStatus: "IN" },
    { brandName: "Lantus Solostar", genericName: "Insulin Glargine", saltComposition: "Insulin Glargine 100 IU/ml", strength: "100 IU/ml", dosageForm: "Injection", route: "SC", price: 950, stockStatus: "IN" },
    { brandName: "Eltroxin 50", genericName: "Thyroxine Sodium", saltComposition: "Thyroxine Sodium 50mcg", strength: "50mcg", dosageForm: "Tablet", route: "PO", price: 130, stockStatus: "IN" },
    { brandName: "Thyronorm 50", genericName: "Thyroxine Sodium", saltComposition: "Thyroxine Sodium 50mcg", strength: "50mcg", dosageForm: "Tablet", route: "PO", price: 145, stockStatus: "IN" },
    { brandName: "Lipitor 10", genericName: "Atorvastatin", saltComposition: "Atorvastatin Calcium 10mg", strength: "10mg", dosageForm: "Tablet", route: "PO", price: 180, stockStatus: "IN" },
    { brandName: "Atorva 10", genericName: "Atorvastatin", saltComposition: "Atorvastatin Calcium 10mg", strength: "10mg", dosageForm: "Tablet", route: "PO", price: 95, stockStatus: "IN" },
    { brandName: "Rozavel 10", genericName: "Rosuvastatin", saltComposition: "Rosuvastatin Calcium 10mg", strength: "10mg", dosageForm: "Tablet", route: "PO", price: 120, stockStatus: "IN" },
    { brandName: "Clopilet 75", genericName: "Clopidogrel", saltComposition: "Clopidogrel Bisulfate 75mg", strength: "75mg", dosageForm: "Tablet", route: "PO", price: 110, stockStatus: "IN" },
    { brandName: "Ecospirin 75", genericName: "Aspirin", saltComposition: "Aspirin 75mg", strength: "75mg", dosageForm: "Tablet", route: "PO", price: 10, stockStatus: "IN" },
    { brandName: "Jalra-M 50/500", genericName: "Vildagliptin + Metformin", saltComposition: "Vildagliptin 50mg + Metformin Hydrochloride 500mg", strength: "550mg", dosageForm: "Tablet", route: "PO", price: 260, stockStatus: "IN" },
    { brandName: "Wycort 5", genericName: "Prednisolone", saltComposition: "Prednisolone 5mg", strength: "5mg", dosageForm: "Tablet", route: "PO", price: 12, stockStatus: "IN" },
    { brandName: "Wysolone 10", genericName: "Prednisolone", saltComposition: "Prednisolone 10mg", strength: "10mg", dosageForm: "Tablet", route: "PO", price: 20, stockStatus: "IN" }
  ],
  "ICU Medication": [
    { brandName: "Tazact 4.5g", genericName: "Piperacillin + Tazobactam", saltComposition: "Piperacillin 4g + Tazobactam 0.5g", strength: "4.5g", dosageForm: "Injection", route: "IV", price: 480, stockStatus: "IN" },
    { brandName: "Meronem 1g", genericName: "Meropenem", saltComposition: "Meropenem 1g", strength: "1g", dosageForm: "Injection", route: "IV", price: 950, stockStatus: "IN" },
    { brandName: "Vancomycin 500 Inj", genericName: "Vancomycin", saltComposition: "Vancomycin 500mg", strength: "500mg", dosageForm: "Injection", route: "IV", price: 350, stockStatus: "IN" },
    { brandName: "Targocid 400 Inj", genericName: "Teicoplanin", saltComposition: "Teicoplanin 400mg", strength: "400mg", dosageForm: "Injection", route: "IV", price: 1800, stockStatus: "IN" },
    { brandName: "Coly-Monas 2M Inj", genericName: "Colistin", saltComposition: "Colistimethate Sodium 2 Million IU", strength: "2 Million IU", dosageForm: "Injection", route: "IV", price: 1600, stockStatus: "IN" },
    { brandName: "Dobutrex Inj", genericName: "Dobutamine", saltComposition: "Dobutamine 250mg/20ml", strength: "250mg/20ml", dosageForm: "Injection", route: "IV", price: 350, stockStatus: "LS" }, // LS
    { brandName: "Nitrocin Inj", genericName: "Nitroglycerin", saltComposition: "Nitroglycerin 50mg/10ml", strength: "50mg/10ml", dosageForm: "Injection", route: "IV", price: 280, stockStatus: "LS" }, // LS
    { brandName: "Lasix Inj", genericName: "Furosemide", saltComposition: "Furosemide 20mg/2ml", strength: "20mg/2ml", dosageForm: "Injection", route: "IV", price: 12, stockStatus: "IN" },
    { brandName: "Midazolam Inj 5", genericName: "Midazolam", saltComposition: "Midazolam 5mg/5ml", strength: "5mg/5ml", dosageForm: "Injection", route: "IV", price: 65, stockStatus: "IN" },
    { brandName: "Propofol Inj 1%", genericName: "Propofol", saltComposition: "Propofol 10mg/ml 20ml", strength: "1% 20ml", dosageForm: "Injection", route: "IV", price: 240, stockStatus: "IN" },
    { brandName: "Fentanyl Inj 100", genericName: "Fentanyl", saltComposition: "Fentanyl 100mcg/2ml", strength: "100mcg/2ml", dosageForm: "Injection", route: "IV", price: 220, stockStatus: "IN" },
    { brandName: "Norcuron Inj 4", genericName: "Vecuronium Bromide", saltComposition: "Vecuronium Bromide 4mg", strength: "4mg", dosageForm: "Injection", route: "IV", price: 380, stockStatus: "IN" },
    { brandName: "Lox Inj 2%", genericName: "Lignocaine", saltComposition: "Lignocaine Hydrochloride 2% w/v", strength: "2% 30ml", dosageForm: "Injection", route: "IV", price: 60, stockStatus: "IN" },
    { brandName: "Heparin 25000 Inj", genericName: "Heparin", saltComposition: "Heparin Sodium 25000 IU/5ml", strength: "25000 IU/5ml", dosageForm: "Injection", route: "IV", price: 550, stockStatus: "IN" },
    { brandName: "Vasopressin Inj 20", genericName: "Vasopressin", saltComposition: "Vasopressin 20 units/ml", strength: "20 units/ml", dosageForm: "Injection", route: "IV", price: 420, stockStatus: "IN" }
  ]
};

const flatList = [];
let codeIndex = 1;

for (const cat in categories) {
  for (const item of categories[cat]) {
    item.category = cat;
    item.code = "RX-MED-" + String(codeIndex++).padStart(3, '0');
    flatList.push(item);
  }
}

let currentOOS = flatList.filter(x => x.stockStatus === 'OOS').length;
let currentLS = flatList.filter(x => x.stockStatus === 'LS').length;

// We need exactly 25 OOS and 25 LS out of 125.
for (const item of flatList) {
  if (currentOOS < 25 && item.stockStatus === 'IN') {
    const skipList = ["Calpol 500", "Calpol 650", "Clavam 625", "Pan 40", "Emset Inj 4", "Telmisartan 40", "Sinarest", "D-Cold Total", "Wikoryl"];
    if (skipList.includes(item.brandName)) continue;
    item.stockStatus = 'OOS';
    currentOOS++;
  }
}

for (const item of flatList) {
  if (currentLS < 25 && item.stockStatus === 'IN') {
    item.stockStatus = 'LS';
    currentLS++;
  }
}

for (const item of flatList) {
  item.minStock = 100;
  if (item.stockStatus === 'OOS') {
    item.stock = 0;
  } else if (item.stockStatus === 'LS') {
    item.stock = 30;
  } else {
    item.stock = 500;
  }
  delete item.stockStatus;
}

console.log("Total generated:", flatList.length);
console.log("OOS:", flatList.filter(x => x.stock === 0).length);
console.log("LS:", flatList.filter(x => x.stock > 0 && x.stock <= x.minStock).length);
console.log("IN:", flatList.filter(x => x.stock > x.minStock).length);

const fileContent = `window.newMedicationCatalog = ${JSON.stringify(flatList, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, 'new_catalog.json'), fileContent);
console.log("Written successfully to new_catalog.json!");
