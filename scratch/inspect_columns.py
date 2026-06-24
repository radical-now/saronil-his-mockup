import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
xl = pd.ExcelFile(excel_path)

for sheet in xl.sheet_names:
    if sheet in ['Index', 'Master_Picklist', 'Sources']:
        continue
    print(f"\n--- Sheet: {sheet} ---")
    df = pd.read_excel(excel_path, sheet_name=sheet, header=3)
    print("Columns:", list(df.columns))
    print("First row data:")
    print(df.iloc[0].to_dict())
