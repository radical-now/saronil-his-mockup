import json

with open('/Users/home/.gemini/antigravity/scratch/saronil-hms/scratch/transcript.jsonl', 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            step = data.get('step_index')
            if step and 9581 <= step <= 9626:
                print(f"=== Step {step} ({data.get('type')}) ===")
                print(data.get('content', '')[:1000])
        except Exception as e:
            pass
