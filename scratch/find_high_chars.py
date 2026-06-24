import os

root_dir = '/Users/home/.gemini/antigravity/scratch/saronil-hms'
high_chars_found = {}

for dirpath, _, filenames in os.walk(root_dir):
    if '.git' in dirpath or '.system_generated' in dirpath or 'scratch' in dirpath:
        continue
    for filename in filenames:
        if not filename.endswith(('.js', '.html', '.css')):
            continue
        filepath = os.path.join(dirpath, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    for char in line:
                        o = ord(char)
                        # We focus on characters outside standard ASCII, latin, and common punctuation (above U+2000)
                        if o > 0x2000 and o < 0xD800 or o > 0xE000:
                            # Let's filter out standard currency symbols or common Indian characters if we want, but let's keep it simple
                            # Let's ignore some common characters if they are too frequent, or just keep them
                            if char not in ['₹', '—', '…', '–', '’', '‘', '”', '“', '′']:
                                relative_path = os.path.relpath(filepath, root_dir)
                                key = (relative_path, char)
                                if key not in high_chars_found:
                                    high_chars_found[key] = []
                                high_chars_found[key].append(line_num)
        except Exception as e:
            pass

for (path, char), lines in sorted(high_chars_found.items()):
    # Limit output length per emoji
    lines_str = str(lines[:10]) + ("..." if len(lines) > 10 else "")
    print(f"{path}: char '{char}' (U+{ord(char):04X}) found on lines {lines_str}")
