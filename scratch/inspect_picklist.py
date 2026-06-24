import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
df = pd.read_excel(excel_path, sheet_name='Master_Picklist')
print("Master_Picklist columns:", list(df.columns))
print("Unique values of columns:")
for col in df.columns:
    print(f"{col}: {df[col].dropna().unique()[:10]}")
