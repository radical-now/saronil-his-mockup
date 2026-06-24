import json

with open('/Users/home/.gemini/antigravity/scratch/saronil-hms/scratch/transcript.jsonl', 'r') as f:
    for line_num, line in enumerate(f, 1):
        if '1782238460288' in line or '1782239238475' in line:
            try:
                data = json.loads(line)
                print(f"=== Line {line_num}, Step {data.get('step_index')} ({data.get('source')}) ===")
                print(data.get('content', '')[:1000])
            except Exception as e:
                print(f"Error parsing line {line_num}: {e}")
