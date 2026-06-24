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
                        # Look for lines containing tabs or buttons or navigation
                        lines = content.split('\\n')
                        for i, l in enumerate(lines):
                            if any(w in l for w in ['tab', 'button', 'nav', 'menu', 'role']):
                                print(f"{i}: {l}")
        except Exception as e:
            pass
