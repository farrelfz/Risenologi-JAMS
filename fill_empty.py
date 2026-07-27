import os

TEMPLATE = """# {title}

> **Status:** Draft
> **Domain:** Risenologi JAMS (Internal CRM)
> **Owner:** Engineering Team

## Purpose
This document defines the {title} for the Risenologi JAMS platform.

## Context
Risenologi JAMS is strictly an internal Editorial Management System. There are NO external Author or Reviewer portals.

---
*Note: This document is pending detailed implementation.*
"""

def format_title(filename):
    name = os.path.splitext(filename)[0]
    # Replace dashes with spaces and title case
    return name.replace("-", " ").title()

docs_dir = 'docs'
for root, dirs, files in os.walk(docs_dir):
    for file in files:
        if file.endswith('.md'):
            filepath = os.path.join(root, file)
            # Only fill empty files
            if os.path.getsize(filepath) == 0:
                title = format_title(file)
                if file == "README.md":
                    # Special case for READMEs
                    folder_name = os.path.basename(root)
                    title = folder_name.replace("-", " ").title() + " Overview"
                
                content = TEMPLATE.format(title=title)
                with open(filepath, 'w') as f:
                    f.write(content)

print("Empty files populated.")
