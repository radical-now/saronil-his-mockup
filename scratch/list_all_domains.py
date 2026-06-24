import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
xl = pd.ExcelFile(excel_path)
for sheet in xl.sheet_names:
    print(f"\nSheet: {sheet}")
    try:
        df = pd.read_excel(excel_path, sheet_name=sheet, header=3)
        if 'Domain' in df.columns:
            print("  Unique Domains:", df['Domain'].dropna().unique())
        else:
            # Let's see if there's any column that resembles domain
            domain_cols = [c for c in df.columns if 'domain' in str(c).lower()]
            if domain_cols:
                for dc in domain_cols:
                    print(f"  Col '{dc}' Unique Domains:", df[dc].dropna().unique())
            else:
                print("  No Domain column found. Columns:", list(df.columns))
    except Exception as e:
        print("  Error:", str(e))
