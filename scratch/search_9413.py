import json

with open('/Users/home/.gemini/antigravity/scratch/saronil-hms/scratch/transcript_full.jsonl', 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('step_index') == 9413:
                tool_calls = data.get('tool_calls', [])
                for tc in tool_calls:
                    if tc.get('name') == 'write_to_file':
                        args = tc.get('args', {})
                        content = args.get('CodeContent', '')
                        lines = content.split('\n')
                        for i, l in enumerate(lines, 1):
                            if any(e in l for e in ['🛏️', '🏠', '📋', '👥', '📝', '🩺']):
                                print(f"Line {i}: {l}")
        except Exception as e:
            pass
