import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
xl = pd.ExcelFile(excel_path)

for sheet in xl.sheet_names:
    if sheet in ['Index', 'Master_Picklist', 'Sources']:
        continue
    print(f"\n--- Sheet: {sheet} ---")
    df = pd.read_excel(excel_path, sheet_name=sheet, header=4)
    print("Columns:", list(df.columns))
    print("Unique domains:", df['Domain'].dropna().unique())
    print("Total rows:", len(df))
    # print domains count
    print("Domain counts:")
    print(df['Domain'].value_counts())
    print("Sample row for Gyn_Obs:")
    if sheet == 'Gyn_Obs':
        print(df.head(2).to_dict(orient='records'))
