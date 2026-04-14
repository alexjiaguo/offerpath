import os
import re

TARGET_DIR = "src"

def process_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    orig_content = content
    
    # 1. replace hover:text-white -> hover:text-zinc-900 dark:hover:text-white
    content = re.sub(r'(?<!dark:)hover:text-white\b', r'hover:text-zinc-900 dark:hover:text-white', content)
    
    # 2. replace hover:text-gray/zinc-[100-400]
    content = re.sub(r'(?<!dark:)hover:text-(zinc|gray)-(100|200|300|400)\b', r'hover:text-zinc-900 dark:hover:text-\1-\2', content)

    # 3. replace text-gray-[100-400] without dark: prefix
    # EXCEPT when inside a gradient/dark bg. This is tricky.
    
    if orig_content != content:
        with open(filepath, "w") as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(TARGET_DIR):
    for filename in files:
        if filename.endswith(".tsx") or filename.endswith(".ts"):
            process_file(os.path.join(root, filename))

