import json

with open('/Users/home/.gemini/antigravity/scratch/saronil-hms/scratch/transcript_full.jsonl', 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('step_index') == 9487:
                print(json.dumps(data, indent=2))
        except:
            pass
