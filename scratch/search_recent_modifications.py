import json

with open('/Users/home/.gemini/antigravity/scratch/saronil-hms/scratch/transcript_full.jsonl', 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            step = data.get('step_index')
            if step and step > 9580:
                tool_calls = data.get('tool_calls', [])
                for tc in tool_calls:
                    if tc.get('name') in ['write_to_file', 'replace_file_content', 'multi_replace_file_content']:
                        print(f"Step {step}: Tool={tc.get('name')}, Args={tc.get('args')}")
        except Exception as e:
            pass
