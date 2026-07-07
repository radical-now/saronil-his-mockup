#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Let's inspect line indices: lines is 0-indexed, so line 3845 is index 3844.
# We want to remove the duplicate block. Let's find it dynamically to be extremely safe.
# The duplicate starts with '    container.innerHTML = `' followed shortly by '      const activeModal = window.p360ActiveModal;'
# and ends with '      `;\n    }\n' or similar.

start_idx = -1
end_idx = -1

for i in range(len(lines)):
    if "container.innerHTML = `" in lines[i]:
        # Check if the next few lines contain activeModal
        if i + 2 < len(lines) and "const activeModal = window.p360ActiveModal;" in lines[i+2]:
            start_idx = i
            break

if start_idx != -1:
    # Find the end of this duplicate block, which ends before the next real 'container.innerHTML = `'
    for j in range(start_idx + 1, len(lines)):
        if "container.innerHTML = `" in lines[j]:
            # This is the real container.innerHTML start!
            end_idx = j
            break

if start_idx != -1 and end_idx != -1:
    print(f"Removing lines {start_idx + 1} to {end_idx}")
    new_lines = lines[:start_idx] + lines[end_idx:]
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("SUCCESS: Remnants cleaned.")
else:
    print(f"FAILED to find indices. start_idx={start_idx}, end_idx={end_idx}")
