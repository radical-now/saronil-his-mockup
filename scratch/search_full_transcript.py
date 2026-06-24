import json

with open('/Users/home/.gemini/antigravity/scratch/saronil-hms/scratch/transcript_full.jsonl', 'r') as f:
    for line_num, line in enumerate(f, 1):
        try:
            data = json.loads(line)
            step = data.get('step_index')
            if step and step > 9511:
                content = str(data.values())
                if any(w in content for w in ['tab bar', 'selector', 'Bed Details', 'Patients Registry', 'Doctor Orders']):
                    print(f"Step {step} ({data.get('type')}) matches.")
                    # print snippet
                    print(data.get('content', '')[:500])
        except Exception as e:
            pass
