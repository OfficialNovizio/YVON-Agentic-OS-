import json, collections
p = "rag/chunks/chunks.json"
d = json.load(open(p, encoding="utf-8"))
ch = d.get("chunks", d) if isinstance(d, dict) else d
print("chunks.json entries:", len(ch))
bs = [c for c in ch if "\\" in (c.get("source_file") or "")]
fs = [c for c in ch if "/" in (c.get("source_file") or "")]
print("with backslash      :", len(bs))
print("with forward slash  :", len(fs))
print()
print("--- sample source_file values ---")
for c in ch[:6]:
    print("   ", repr(c.get("source_file"))[:90])
print()
# do any source_file values contain BOTH separators in one string?
mixed = [c for c in ch if "\\" in (c.get("source_file") or "") and "/" in (c.get("source_file") or "")]
print("mixed separators in one path:", len(mixed))
for c in mixed[:5]:
    print("   ", repr(c.get("source_file"))[:110])
