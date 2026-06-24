import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
xl = pd.ExcelFile(excel_path)

for sheet in ['Gyn_Obs', 'Paeds', 'IVF', 'Psychiatry']:
    print(f"\n================ {sheet} ================")
    df = pd.read_excel(excel_path, sheet_name=sheet, header=4)
    for rank in [1, 2, 3, 50]:
        print(f"\n--- Rank {rank} ---")
        for domain in ['Symptoms and Findings', 'Diagnoses', 'Investigations', 'Procedures']:
            row = df[(df['Domain'] == domain) & (df['Rank'] == rank)]
            if not row.empty:
                print(f"{domain}: {row.iloc[0]['Display Term']}")
            else:
                print(f"{domain}: NOT FOUND")
