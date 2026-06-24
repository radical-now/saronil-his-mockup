import os
import re

root_dir = '/Users/home/.gemini/antigravity/scratch/saronil-hms'

# Regex for finding emojis and common clinical/UI emojis
# Emojis are generally in the range U+1F300 to U+1F9FF, U+2600 to U+27BF, U+1FA70 to U+1FAFF
emoji_pattern = re.compile(r'[\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]')

emojis_found = {}

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
                    matches = emoji_pattern.findall(line)
                    if matches:
                        relative_path = os.path.relpath(filepath, root_dir)
                        for m in matches:
                            key = (relative_path, m)
                            if key not in emojis_found:
                                emojis_found[key] = []
                            emojis_found[key].append(line_num)
        except Exception as e:
            pass

for (path, emoji), lines in sorted(emojis_found.items()):
    print(f"{path}: emoji '{emoji}' found on lines {lines}")
