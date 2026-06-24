import pandas as pd
import json

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
xl = pd.ExcelFile(excel_path)

finding_keywords = [
    'finding', 'exam', 'signs', 'tenderness', 'presentation', 
    'smaller than dates', 'larger than dates', 'pallor', 'cyanosis', 
    'edema', 'murmur', 'mass', 'swelling', 'discharge on exam',
    'lesion', 'ulcer', 'wart', 'reflex', 'tone', 'gait',
    'height', 'weight', 'tension', 'distended', 'rigid', 'palpable'
]

def classify_term(term, rank):
    # If rank is 91-100, classify as Finding for Gyn and Obs or Paeds
    t = term.lower()
    for kw in finding_keywords:
        if kw in t:
            return 'Finding'
    return 'Symptom'

specialties_data = {}

sheet_mapping = {
    'Gyn_Obs': 'Gynecology & Obs',
    'Paeds': 'Pediatrics',
    'IVF': 'IVF & Fertility',
    'Psychiatry': 'Psychiatry'
}

for sheet, spec_name in sheet_mapping.items():
    df = pd.read_excel(excel_path, sheet_name=sheet, header=4)
    
    symptoms = []
    findings = []
    diagnoses = []
    investigations = []
    procedures = []
    
    # Process Symptoms and Findings
    sf_df = df[df['Domain'] == 'Symptoms and Findings']
    for _, row in sf_df.iterrows():
        term = str(row['Display Term']).strip()
        rank = int(row['Rank'])
        label = classify_term(term, rank)
        if rank >= 91 and sheet in ['Gyn_Obs', 'Paeds']:
            label = 'Finding'
        
        item = {'rank': rank, 'term': term}
        if label == 'Symptom':
            symptoms.append(item)
        else:
            findings.append(item)
            
    # Process Diagnoses
    diag_df = df[df['Domain'] == 'Diagnoses']
    for _, row in diag_df.iterrows():
        diagnoses.append({
            'rank': int(row['Rank']),
            'term': str(row['Display Term']).strip()
        })
        
    # Process Investigations
    inv_df = df[df['Domain'] == 'Investigations']
    for _, row in inv_df.iterrows():
        investigations.append({
            'rank': int(row['Rank']),
            'term': str(row['Display Term']).strip()
        })
        
    # Process Procedures
    proc_df = df[df['Domain'] == 'Procedures']
    for _, row in proc_df.iterrows():
        procedures.append({
            'rank': int(row['Rank']),
            'term': str(row['Display Term']).strip()
        })
        
    specialties_data[spec_name] = {
        'symptoms': symptoms,
        'findings': findings,
        'diagnoses': diagnoses,
        'investigations': investigations,
        'procedures': procedures
    }

# Write to assets/js/specialty_data.js
js_content = f"window.specialtyData = {json.dumps(specialties_data, indent=2)};\n"
with open('/Users/home/.gemini/antigravity/scratch/saronil-hms/assets/js/specialty_data.js', 'w') as f:
    f.write(js_content)

print("Parsed and saved specialty data successfully!")
