import os
import re

root_dir = '/Users/home/.gemini/antigravity/scratch/saronil-hms'
patterns = [
    r'Bed[\s\n\r]*Details',
    r'Patients[\s\n\r]*Registry',
    r'Doctor[\s\n\r]*Orders',
    r'🛏️[\s\n\r]*🏠[\s\n\r]*Bed[\s\n\r]*Details',
    r'📋[\s\n\r]*👥[\s\n\r]*Patients[\s\n\r]*Registry',
    r'📝[\s\n\r]*🩺[\s\n\r]*Doctor[\s\n\r]*Orders'
]

compiled_patterns = [re.compile(p, re.IGNORECASE | re.MULTILINE) for p in patterns]

for dirpath, _, filenames in os.walk(root_dir):
    parts = dirpath.split(os.sep)
    if '.git' in parts or '.system_generated' in parts or 'scratch' in parts:
        if 'saronil-hms' in parts:
            idx = parts.index('saronil-hms')
            if 'scratch' in parts[idx:]:
                continue
        else:
            continue
    for filename in filenames:
        if not filename.endswith(('.js', '.html', '.css')):
            continue
        filepath = os.path.join(dirpath, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                for p_str, cp in zip(patterns, compiled_patterns):
                    match = cp.search(content)
                    if match:
                        relative_path = os.path.relpath(filepath, root_dir)
                        # Print around match
                        start = max(0, match.start() - 100)
                        end = min(len(content), match.end() + 100)
                        snippet = content[start:end].replace('\n', ' [NL] ')
                        print(f"{relative_path} matched pattern '{p_str}': ... {snippet} ...")
        except Exception as e:
            pass
