import pandas as pd
import json

excel_path = '/Users/home/Downloads/emr_specialty_seed_dictionary_top100.xlsx'
df = pd.read_excel(excel_path, sheet_name='Gyn_Obs', header=4)

# Keep rows where Domain is not null
df = df[df['Domain'].notna()]
records = df.to_dict(orient='records')

with open('/Users/home/.gemini/antigravity/scratch/saronil-hms/scratch/gyn_obs.json', 'w') as f:
    json.dump(records, f, indent=2)

print("Saved Gyn_Obs sheet records. Total:", len(records))
