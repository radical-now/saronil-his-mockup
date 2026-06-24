import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'

finding_keywords = [
    'finding', 'exam', 'signs', 'tenderness', 'presentation', 
    'smaller than dates', 'larger than dates', 'pallor', 'cyanosis', 
    'edema', 'murmur', 'mass', 'swelling', 'discharge on exam',
    'lesion', 'ulcer', 'wart', 'tenderness', 'reflex', 'tone', 'gait',
    'height', 'weight', 'tension', 'distended', 'rigid', 'palpable'
]

def classify_term(term):
    t = term.lower()
    for kw in finding_keywords:
        if kw in t:
            return 'Finding'
    return 'Symptom'

xl = pd.ExcelFile(excel_path)
for sheet in ['Gyn_Obs', 'Paeds', 'IVF', 'Psychiatry']:
    print(f"\n================ {sheet} ================")
    df = pd.read_excel(excel_path, sheet_name=sheet, header=4)
    sf = df[df['Domain'] == 'Symptoms and Findings']
    symptoms = []
    findings = []
    for idx, row in sf.iterrows():
        term = row['Display Term']
        label = classify_term(term)
        if label == 'Symptom':
            symptoms.append(term)
        else:
            findings.append(term)
    print(f"Total Symptoms: {len(symptoms)} | Total Findings: {len(findings)}")
    print("Sample Symptoms (first 5):", symptoms[:5])
    print("Sample Findings (first 5):", findings[:5])
