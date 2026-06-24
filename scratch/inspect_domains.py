import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
xl = pd.ExcelFile(excel_path)

for sheet in ['Gyn_Obs', 'Paeds', 'IVF', 'Psychiatry']:
    print(f"\n================ {sheet} ================")
    df = pd.read_excel(excel_path, sheet_name=sheet, header=4)
    for domain in df['Domain'].dropna().unique():
        sub = df[df['Domain'] == domain]
        print(f"Domain: {domain} | Count: {len(sub)} | Ranks: {sub['Rank'].min()} to {sub['Rank'].max()}")
