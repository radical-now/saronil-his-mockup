#!/usr/bin/env python3
"""
Revert and clean hospMgmtView.js by removing the renderPatientRecordsTab block.
"""

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/hospMgmtView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Locate the beginning of the Patient Records function
start_marker = "  // ========================================================================\n  // PERSONA 6: PATIENT RECORDS WORKSPACE\n  // ========================================================================"
start_idx = src.find(start_marker)

if start_idx == -1:
    print("Could not find start marker in hospMgmtView.js")
    exit(1)

# The IIFE closing block is at the very end of the file
# We find the closing braces. Let's find the closing for the outer function
# The end of the file should look like:
#     };
#   }
# 
# })();
# so we want to keep the closing })();

end_marker = "  }\n\n})();"
end_idx = src.rfind(end_marker)

if end_idx == -1:
    # Try alternate end marker
    end_marker = "})();"
    end_idx = src.rfind(end_marker)
    if end_idx == -1:
        print("Could not find end marker in hospMgmtView.js")
        exit(1)

# Reconstruct without the Patient Records tab
new_src = src[:start_idx] + "  }\n\n})();\n"

with open(path, "w", encoding="utf-8") as f:
    f.write(new_src)

print("SUCCESS: renderPatientRecordsTab cleanly removed from hospMgmtView.js")
