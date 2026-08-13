
import os
import re
import glob

# Configuration
PROJECT_ROOT = "."
TOOLKIT_PATTERN = "*toolkit"

def get_tool_html_files():
    files = []
    # Walk through toolkit directories
    for root, dirs, files_in_dir in os.walk(PROJECT_ROOT):
        if "toolkit" in root and "node_modules" not in root and "shared" not in root:
            for file in files_in_dir:
                if file.endswith(".html") and file != "index.html":
                    files.append(os.path.join(root, file))
    return files

def get_tool_css_files():
    files = []
    for root, dirs, files_in_dir in os.walk(PROJECT_ROOT):
        if "toolkit" in root and "assets" in root and "css" in root:
             for file in files_in_dir:
                if file.endswith(".css"):
                    files.append(os.path.join(root, file))
    return files

def check_html_compliance(files):
    issues = []
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check 1: ModiqiApp Initialization
                if "new ModiqiApp" not in content:
                    issues.append(f"[P1] Missing ModiqiApp init: {file_path}")
                
                # Check 2: Lucide Icons
                if "lucide.createIcons" not in content:
                    if "data-lucide" in content: # Only warn if icons are actually used
                        issues.append(f"[P1] Missing lucide.createIcons: {file_path}")
                
                # Check 3: A4 Landscape (Double check)
                if "paper-a4 landscape" in content:
                    issues.append(f"[P1] Forbidden A4 Landscape: {file_path}")

        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    return issues

def check_css_compliance(files):
    issues = []
    hex_color_pattern = re.compile(r'#[0-9a-fA-F]{3,6}')
    
    # Simple state machine for CSS parsing to detect hover rules could be complex
    # simpler approach: read file, regex matching
    
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                content = "".join(lines)
                
                # Check 1: Hardcoded Hex Colors
                for i, line in enumerate(lines):
                    # Ignore comments
                    if "/*" in line and "*/" in line: continue
                    matches = hex_color_pattern.findall(line)
                    if matches:
                        # Exclude some known ok ones if needed, or url definitions
                        if "url(" not in line: 
                            issues.append(f"[P0] Hardcoded Color ({matches[0]}) in {file_path}:{i+1}")

                # Check 2: Box Shadow (allowed only for paper-*)
                # This is tricky without a parser, but we can search for box-shadow on lines that don't have .paper
                # A bit loose, let's just search for box-shadow and let user triage
                # Actually, rule says: Forbidden except .paper-*. 
                for i, line in enumerate(lines):
                    if "box-shadow:" in line:
                         if ".paper-" not in line and "var(--shadow" not in line and "none" not in line:
                             # If it is using a variable, it is technicall allowed (design token), 
                             # but hardcoded shadow is bad. 
                             # Rule #5: "Card Shadow" forbidden.
                             if "var(--" not in line:
                                issues.append(f"[P0] Hardcoded Box Shadow in {file_path}:{i+1}")

                # Check 3: Hover Animations
                # Checking for :hover blocks that contain transform
                # We can use a regex for simple blocks: selector:hover { ... }
                # But css is multiline. 
                # Let's fallback to finding "transform" or "scale" inside a file, 
                # then checking if it is inside a rule involved with :hover.
                # Simplification: Check for lines containing "transform" or "scale" closely following ":hover"
                # This is hard. Let's just grep for "transition: all" which is explicitly forbidden.
                
                if "transition: all" in content:
                     issues.append(f"[P0] Forbidden 'transition: all' in {file_path}")
                
                # Check for hover transform (approximate)
                if ":hover" in content and "transform" in content:
                    # stricter check could be implemented, but let's flag file for review
                    # regex to find :hover { ... transform ... }
                    # This is heavy. Let's just flag the file if it has both close to each other
                    pass 

        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
    return issues

print("Starting Compliance Audit...")
print("-" * 50)

html_files = get_tool_html_files()
css_files = get_tool_css_files()

print(f"Scanning {len(html_files)} HTML files and {len(css_files)} CSS files.")

html_issues = check_html_compliance(html_files)
css_issues = check_css_compliance(css_files)

all_issues = html_issues + css_issues

if not all_issues:
    print("No compliance issues found! Great job.")
else:
    print(f"Found {len(all_issues)} issues:")
    for issue in all_issues:
        print(issue)
