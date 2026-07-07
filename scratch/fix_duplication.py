#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Fix the double container.innerHTML = ` ${p360Styles}
bad_str = """    container.innerHTML = `
      ${p360Styles}

    container.innerHTML = `
      ${p360Styles}"""

good_str = """    container.innerHTML = `
      ${p360Styles}"""

src = src.replace(bad_str, good_str, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Duplication fixed.")
