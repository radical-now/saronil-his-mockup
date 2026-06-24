import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
xl = pd.ExcelFile(excel_path)
for sheet in xl.sheet_names:
    print(f"\nSheet: {sheet}")
    df = pd.read_excel(excel_path, sheet_name=sheet)
    for col in df.columns:
        # Check if the word "medicine" or "drug" is in the column values (as string)
        mask = df[col].astype(str).str.lower().str.contains('medicine|drug|pharmacy|presc', na=False)
        if mask.any():
            print(f"  Col '{col}' contains matches! Count: {mask.sum()}")
            print(f"  Samples: {df[mask][col].head(3).tolist()}")
