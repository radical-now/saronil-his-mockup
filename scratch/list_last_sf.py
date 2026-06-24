import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
for sheet in ['IVF', 'Psychiatry']:
    print(f"\n================ {sheet} ================")
    df = pd.read_excel(excel_path, sheet_name=sheet, header=4)
    sf = df[df['Domain'] == 'Symptoms and Findings']
    for idx, row in sf.tail(15).iterrows():
        print(f"Rank {row['Rank']}: {row['Display Term']}")
