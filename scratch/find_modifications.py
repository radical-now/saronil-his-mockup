import json

with open('/Users/home/.gemini/antigravity/scratch/saronil-hms/scratch/transcript.jsonl', 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            step = data.get('step_index')
            if step and step >= 9480:
                if data.get('type') == 'CODE_ACTION' or 'replace_file_content' in str(data):
                    print(f"=== Step {step} ({data.get('type')}) ===")
                    print(data.get('content', '')[:1000])
                    if data.get('tool_calls'):
                        print(json.dumps(data.get('tool_calls'), indent=2))
        except Exception as e:
            pass
