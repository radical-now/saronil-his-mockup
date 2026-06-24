import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
xl = pd.ExcelFile(excel_path)

for sheet in ['Gyn_Obs', 'Paeds', 'IVF', 'Psychiatry']:
    print(f"\n================ {sheet} ================")
    df = pd.read_excel(excel_path, sheet_name=sheet, header=4)
    sf = df[df['Domain'] == 'Symptoms and Findings']
    print(f"Total Symptoms and Findings: {len(sf)}")
    print("Unique EMR Field Types:", sf['EMR Field Type'].unique())
    print("Unique Recommended Use:", sf['Recommended Use'].unique())
    print("Sample terms (first 10):")
    for idx, row in sf.head(10).iterrows():
        print(f"Rank {row['Rank']}: {row['Display Term']} | Field Type: {row['EMR Field Type']} | Rec: {row['Recommended Use']}")
