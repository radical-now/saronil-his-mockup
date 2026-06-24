import json

with open('/Users/home/.gemini/antigravity/scratch/saronil-hms/scratch/transcript.jsonl', 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            step = data.get('step_index')
            if step and step >= 9580:
                print(f"Step {step} ({data.get('type')}): {data.get('content', '')[:300]}...")
        except:
            pass
