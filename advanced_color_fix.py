import os
import re

TARGET_DIR = "src"

def process_classes(class_string):
    # Split classes by whitespace
    classes = class_string.split()
    
    # Identify if it has a dark background natively
    has_dark_bg = any(
        c.startswith('gradient-') or
        c.startswith('bg-brand-') or
        c.startswith('bg-amber-') or
        c.startswith('bg-blue-') or
        c.startswith('bg-red-') or
        c.startswith('bg-rose-') or
        c.startswith('bg-zinc-800') or
        c.startswith('bg-zinc-900') or
        c == 'bg-black'
        for c in classes
    )
    
    new_classes = []
    
    for c in classes:
        # Ignore already dark variant
        if c.startswith('dark:'):
            new_classes.append(c)
            continue
            
        # Process hover:text-white
        if c == 'hover:text-white':
            if not has_dark_bg and 'dark:hover:text-white' not in classes:
                new_classes.append('hover:text-zinc-900')
                new_classes.append('dark:hover:text-white')
                continue
                
        # Process text-white
        if c == 'text-white':
            if not has_dark_bg and 'dark:text-white' not in classes:
                new_classes.append('text-zinc-900')
                new_classes.append('dark:text-white')
                continue
                
        # Process text-zinc-[100-400] and text-gray-[100-400]
        m = re.match(r'text-(zinc|gray)-(50|100|200|300|400)$', c)
        if m:
            if not has_dark_bg and f'dark:text-zinc-{m.group(2)}' not in classes and f'dark:text-gray-{m.group(2)}' not in classes:
                new_classes.append('text-zinc-700')
                new_classes.append(f'dark:text-{m.group(1)}-{m.group(2)}')
                continue
                
        # Process hover:text-zinc-[100-400]
        m = re.match(r'hover:text-(zinc|gray)-(50|100|200|300|400)$', c)
        if m:
            if not has_dark_bg and f'dark:hover:text-zinc-{m.group(2)}' not in classes and f'dark:hover:text-gray-{m.group(2)}' not in classes:
                new_classes.append('hover:text-zinc-900')
                new_classes.append(f'dark:hover:text-{m.group(1)}-{m.group(2)}')
                continue

        # Check border colors! border-white/10 -> border-zinc-200 dark:border-white/10
        if c == 'border-white/10' or c == 'border-white/[0.05]' or c == 'border-white/[0.06]' or c == 'border-white/20':
             if not has_dark_bg and f'dark:{c}' not in classes:
                 new_classes.append('border-zinc-200')
                 new_classes.append(f'dark:{c}')
                 continue
                 
                 
        new_classes.append(c)
        
    # Remove duplicates but preserve order (mostly)
    seen = set()
    final_classes = []
    for c in new_classes:
        if c not in seen:
            seen.add(c)
            final_classes.append(c)
            
    return " ".join(final_classes)

def process_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Find all className="..." or className={'...'} or `...`
    # We'll use a regex that handles generic class strings.
    # className="something"
    def replace_classname(m):
        prefix = m.group(1)
        classes = m.group(2)
        quote = m.group(3)
        return f'{prefix}{process_classes(classes)}{quote}'

    orig_content = content
    content = re.sub(r'(className=["`\'])([^"`\']+)(["`\'])', replace_classname, content)
    
    if orig_content != content:
        with open(filepath, "w") as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(TARGET_DIR):
    for filename in files:
        if filename.endswith(".tsx") or filename.endswith(".ts"):
            process_file(os.path.join(root, filename))

