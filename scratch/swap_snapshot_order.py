"""
Swap Financial Snapshot (Row 2) to appear BEFORE Patient Operations (Row 1)
in the Executive Dashboard.
"""

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/dashboardView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# ── Define the two blocks to swap ─────────────────────────────────────────────

# Block A — Patient Operations (currently first)
block_a_start = "          <!-- Row 1: Patient Operations (10 cards) -->"
block_a_end   = "          <!-- Row 2: Financial Overview (5 cards - visible for finance roles) -->"

# Block B — Financial Snapshot (currently second)
block_b_start = "          <!-- Row 2: Financial Overview (5 cards - visible for finance roles) -->"
block_b_end   = "\n        </div>\n\n        <!-- SECTION 2"

# Extract Block A
idx_a_start = src.index(block_a_start)
idx_a_end   = src.index(block_a_end)
block_a = src[idx_a_start:idx_a_end]

# Extract Block B
idx_b_start = src.index(block_b_start)
idx_b_end   = src.index(block_b_end) + 1   # include trailing newline before </div>
block_b = src[idx_b_start:idx_b_end]

# Verify they are contiguous and non-overlapping
assert idx_a_end == idx_b_start, "Blocks are not contiguous — check offsets"

# Build the swapped region: B first, then A
# Update the comment labels to match their new positions
new_block_b = block_b.replace(
    "<!-- Row 2: Financial Overview (5 cards - visible for finance roles) -->",
    "<!-- Row 1: Financial Overview (5 cards - visible for finance roles) -->"
)
new_block_a = block_a.replace(
    "<!-- Row 1: Patient Operations (10 cards) -->",
    "<!-- Row 2: Patient Operations (10 cards) -->"
)

swapped = new_block_b + new_block_a

# Replace the combined original region with the swapped version
original_combined = block_a + block_b
src = src.replace(original_combined, swapped, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS — Financial Snapshot is now Row 1, Patient Operations is now Row 2.")
