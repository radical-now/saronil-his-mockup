import os
import json

log_path = '/Users/home/.gemini/antigravity/brain/8d561aa5-0116-4ce3-b330-54f838531f52/.system_generated/logs/transcript.jsonl'

if not os.path.exists(log_path):
    print("Log path does not exist.")
else:
    print("Log path exists. Searching...")
    with open(log_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            if any(term in line for term in ['Bed Details', 'Patients Registry', 'Doctor Orders', '🛏️', '🏠', '👥', '🩺']):
                try:
                    obj = json.loads(line)
                    print(f"Match on line {line_num}, type: {obj.get('type')}, source: {obj.get('source')}")
                    # Print snippet of tool_calls or content
                    content = str(obj.get('content', ''))
                    tool_calls = str(obj.get('tool_calls', ''))
                    if 'Bed Details' in content or 'Bed Details' in tool_calls:
                        print("   Matched 'Bed Details'")
                    if 'Patients Registry' in content or 'Patients Registry' in tool_calls:
                        print("   Matched 'Patients Registry'")
                    if 'Doctor Orders' in content or 'Doctor Orders' in tool_calls:
                        print("   Matched 'Doctor Orders'")
                except Exception as e:
                    print(f"Error parsing json on line {line_num}: {e}")
