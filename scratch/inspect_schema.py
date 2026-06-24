import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
xl = pd.ExcelFile(excel_path)
print("Sheet Names:", xl.sheet_names)

for sheet in xl.sheet_names:
    if sheet in ['Index', 'Master_Picklist', 'Sources']:
        continue
    print(f"\n--- Sheet: {sheet} ---")
    df = pd.read_excel(excel_path, sheet_name=sheet)
    print("Shape:", df.shape)
    print("Columns (first 10 rows):")
    print(df.head(10))
