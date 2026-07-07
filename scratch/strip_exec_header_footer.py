"""
Patch dashboardView.js to remove the internal sticky header and quick-nav bar
from the Executive Dashboard — these belong to the parent HIS shell.
"""

import re

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/dashboardView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

orig_len = len(src)

# ── 1. Remove CSS: .exec-sticky-header rule ─────────────────────────────────
src = re.sub(
    r"\s*\.exec-sticky-header\s*\{[^}]*\}",
    "",
    src,
    count=1,
)

# ── 2. Remove CSS: .quick-nav-bar + .quick-nav-btn + .quick-nav-btn:hover ───
src = re.sub(
    r"\s*\.quick-nav-bar\s*\{[^}]*\}\s*\.quick-nav-btn\s*\{[^}]*\}\s*\.quick-nav-btn:hover\s*\{[^}]*\}",
    "",
    src,
    count=1,
)

# ── 3. Remove CSS: padding-bottom on .exec-dash-wrapper (reserved for fixed bar)
src = src.replace("        padding-bottom: 60px;\n", "", 1)

# ── 4. Remove HTML: sticky <header class="exec-sticky-header">…</header> ────
#   Match from the HTML comment through to </header>
src = re.sub(
    r"\s*<!-- Sticky Executive Header -->\s*<header class=\"exec-sticky-header\">.*?</header>",
    "",
    src,
    count=1,
    flags=re.DOTALL,
)

# ── 5. Remove HTML: quick-nav-bar <div> block ────────────────────────────────
src = re.sub(
    r"\s*<!-- Live Quick Navigation Bar.*?-->\s*<div class=\"quick-nav-bar\">.*?</div>",
    "",
    src,
    count=1,
    flags=re.DOTALL,
)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

removed = orig_len - len(src)
print(f"SUCCESS — removed {removed:,} bytes of internal header/footer markup from dashboardView.js")
