#!/usr/bin/env python3
"""
Fix duplicate and conflicting Tailwind CSS classes in className attributes.
"""
import os
import re
from pathlib import Path

def fix_duplicates_in_classname(content):
    """Fix duplicate classes within className attributes."""
    
    def process_classname(match):
        classes_str = match.group(1)
        
        # Split classes and preserve order
        classes = classes_str.split()
        
        # Remove exact duplicates while preserving order
        seen = set()
        unique_classes = []
        for cls in classes:
            if cls not in seen:
                seen.add(cls)
                unique_classes.append(cls)
        
        # Handle color conflicts - remove earlier conflicting colors
        final_classes = []
        text_colors_seen = {}
        bg_colors_seen = {}
        border_colors_seen = {}
        
        for cls in unique_classes:
            skip = False
            
            # Handle text-color conflicts
            if cls.startswith('text-') and not cls.startswith('text-['):
                parts = cls.split('-')
                if len(parts) >= 2 and parts[1] in ['gray', 'blue', 'green', 'red', 'yellow', 'purple', 'pink', 'indigo']:
                    color_family = parts[1]
                    # Keep only the latest color from same family
                    if color_family in text_colors_seen:
                        # Remove the previous one
                        final_classes = [c for c in final_classes if c != text_colors_seen[color_family]]
                    text_colors_seen[color_family] = cls
            
            # Handle bg-color conflicts  
            elif cls.startswith('bg-') and not cls.startswith('bg-['):
                parts = cls.split('-')
                if len(parts) >= 2 and parts[1] in ['gray', 'blue', 'green', 'red', 'yellow', 'purple', 'pink', 'indigo']:
                    color_family = parts[1]
                    if color_family in bg_colors_seen:
                        final_classes = [c for c in final_classes if c != bg_colors_seen[color_family]]
                    bg_colors_seen[color_family] = cls
            
            # Handle border-color conflicts
            elif cls.startswith('border-') and not cls.startswith('border-['):
                parts = cls.split('-')
                if len(parts) >= 2 and parts[1] in ['gray', 'blue', 'green', 'red', 'yellow', 'purple', 'pink', 'indigo']:
                    color_family = parts[1]
                    if color_family in border_colors_seen:
                        final_classes = [c for c in final_classes if c != border_colors_seen[color_family]]
                    border_colors_seen[color_family] = cls
            
            if not skip:
                final_classes.append(cls)
        
        # Reconstruct className
        new_classes = ' '.join(final_classes)
        return f'className="{new_classes}"'
    
    # Match className="..." patterns
    pattern = r'className="([^"]*)"'
    content = re.sub(pattern, process_classname, content)
    
    return content

def process_file(filepath):
    """Process a single file to fix Tailwind class duplicates."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        fixed_content = fix_duplicates_in_classname(original_content)
        
        # Only write if changes were made
        if fixed_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function to process all TSX files."""
    base_dir = Path('/Users/ravitejmathurthi/Desktop/billbook')
    
    # Find all .tsx files in app/ and components/
    tsx_files = list(base_dir.glob('app/**/*.tsx')) + list(base_dir.glob('components/**/*.tsx'))
    
    modified_count = 0
    for filepath in tsx_files:
        if process_file(filepath):
            modified_count += 1
            print(f"Fixed: {filepath.relative_to(base_dir)}")
    
    print(f"\nTotal files modified: {modified_count}")

if __name__ == '__main__':
    main()
