import os
import re

root_dir = '/Users/home/.gemini/antigravity/scratch/saronil-hms'
patterns = [
    r'Bed\s*Details',
    r'Patients\s*Registry',
    r'Doctor\s*Orders',
    r'🛏️',
    r'🏠',
    r'📋',
    r'👥',
    r'📝',
    r'🩺'
]

compiled_patterns = [re.compile(p, re.IGNORECASE) for p in patterns]

for dirpath, _, filenames in os.walk(root_dir):
    if '.git' in dirpath or '.system_generated' in dirpath:
        continue
    for filename in filenames:
        if not filename.endswith(('.js', '.html', '.css')):
            continue
        filepath = os.path.join(dirpath, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    for p_str, cp in zip(patterns, compiled_patterns):
                        if cp.search(line):
                            relative_path = os.path.relpath(filepath, root_dir)
                            print(f"{relative_path}:{line_num} (Pattern: {p_str}): {line.strip()}")
        except Exception as e:
            pass
