import os
import time

downloads_dir = '/Users/home/Downloads'
files = [os.path.join(downloads_dir, f) for f in os.listdir(downloads_dir)]
files = [f for f in files if os.path.isfile(f)]
files.sort(key=lambda x: os.path.getmtime(x), reverse=True)

print("Recently modified files in Downloads:")
for f in files[:10]:
    print(f"Path: {f} | Modified: {time.ctime(os.path.getmtime(f))} | Size: {os.path.getsize(f)} bytes")
