import os

root_dir = '/Users/home/.gemini/antigravity/scratch/saronil-hms'

for dirpath, _, filenames in os.walk(root_dir):
    parts = dirpath.split(os.sep)
    if '.git' in parts or '.system_generated' in parts or 'scratch' in parts:
        # Check if 'scratch' is inside the workspace root (i.e. saronil-hms/scratch)
        # saronil-hms is parts[-2] or parts[-1]
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
                for line_num, line in enumerate(f, 1):
                    non_ascii = [c for c in line if ord(c) > 127]
                    if non_ascii:
                        emojis = [c for c in non_ascii if ord(c) > 0x2000 and c not in ['₹', '—', '…', '–', '’', '‘', '”', '“', '′']]
                        if emojis:
                            relative_path = os.path.relpath(filepath, root_dir)
                            print(f"{relative_path}:{line_num}: {' '.join(emojis)} -> {line.strip()}")
        except Exception as e:
            pass
