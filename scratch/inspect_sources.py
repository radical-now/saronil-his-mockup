import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
df = pd.read_excel(excel_path, sheet_name='Sources')
print(df.head(20))
