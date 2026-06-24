import pandas as pd

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
df = pd.read_excel(excel_path, sheet_name='Paeds', header=4)
sf = df[df['Domain'] == 'Symptoms and Findings']
print("Paeds Symptoms and Findings Display Terms:")
for idx, row in sf.iterrows():
    print(f"{row['Rank']}: {row['Display Term']}")
