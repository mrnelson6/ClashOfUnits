"""Verify APPENDIX_ROW_MAP alignment against the CSV."""
import re, json

with open("../docs/srm/app.js") as f:
    src = f.read()

# Extract the array
start = src.index("APPENDIX_ROW_MAP = [")
end = src.index("];", start) + 2
decl = src[start:end]

# Parse: extract quoted strings and nulls
entries = []
for token in re.findall(r'null|"([^"]+)"', decl):
    entries.append(None if token == "null" else token)
# Actually re-parse more carefully
entries = []
inside = decl[decl.index("[")+1 : decl.rindex("]")]
for item in re.split(r",\s*\n?", inside):
    item = item.strip()
    if not item:
        continue
    if item == "null":
        entries.append(None)
    else:
        # Strip quotes
        m = re.match(r'^"(.+)"$', item)
        entries.append(m.group(1) if m else item)

print(f"Row map entries: {len(entries)}")

# Read CSV
with open("data/Appendix _A__ A Clash of Units Scoring Rule Modifications - Rules by Year.csv") as f:
    csv_lines = f.read().strip().split("\n")

print(f"CSV lines: {len(csv_lines)}")

if len(entries) != len(csv_lines):
    print(f"\nLENGTH MISMATCH: map={len(entries)} csv={len(csv_lines)}")
    print(f"  Off by {abs(len(entries) - len(csv_lines))}")

# Check each category row
mismatches = 0
for i, (cat, csv_line) in enumerate(zip(entries, csv_lines)):
    csv_name = csv_line.split(",")[0].strip().strip('"')
    row = i + 1
    if cat is not None:
        # Fuzzy match: first 10 chars of category should appear in CSV name
        cat_prefix = cat.split(" (")[0][:15].lower()
        csv_lower = csv_name.lower()
        if cat_prefix not in csv_lower and csv_lower[:15] not in cat_prefix:
            print(f"  Row {row}: MISMATCH  map='{cat}'  csv='{csv_name}'")
            mismatches += 1

if mismatches == 0:
    print("All category rows align!")
else:
    print(f"{mismatches} mismatches")
