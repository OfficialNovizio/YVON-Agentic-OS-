#!/usr/bin/env python3
"""deep-design-extract.py — deep per-fact design-system extraction for a
reference capture bundle (the "run the deep extraction" step the thin
extraction declares in Known Gaps).

Reads reference.html + assets/*.css from a capture bundle and measures:
grouped palette with usage, per-role typography, radii, spacing, elevation,
container widths, breakpoints — every fact traceable to the captured CSS.
Output: JSON in the DesignSystemFacts shape (dashboard/lib/design-session.ts)
for backfilling a design session so design.md renders the full catalog
(docs/design-md-format.md).

Usage:
    python3 scripts/deep-design-extract.py <capture-bundle-dir>

Owner: dev · design-to-product re-engineer (standing tool), 2026-09-08
"""
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

HEX_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b")
RGB_RE = re.compile(r"rgba?\([^)]+\)")
FONT_RE = re.compile(r"font-family:\s*([^;}]+)", re.I)
SIZE_RE = re.compile(r"font-size:\s*([^;}]+)", re.I)
WEIGHT_RE = re.compile(r"font-weight:\s*(\d{3})", re.I)
RADIUS_RE = re.compile(r"border-radius:\s*([^;}]+)", re.I)
SHADOW_RE = re.compile(r"box-shadow:\s*([^;}]+)", re.I)
SPACE_RE = re.compile(r"(?:^|[{;\s])(padding|gap|margin|row-gap|column-gap)(?:-\w+)?:\s*([^;}]+)", re.I)
MAXW_RE = re.compile(r"(?:max-width|width)\s*:\s*(\d{3,5})px", re.I)
MEDIA_RE = re.compile(r"@media[^{]*?([\d.]+)px")

ROLE_KEYS = {
    "display": ("display", "hero", "giant", "visual-"),
    "h1": ("h1", "title-xl"),
    "h2": ("h2", "title-lg"),
    "h3": ("h3", "title-md"),
    "h4": ("h4", "title-sm"),
    "h5": ("h5", "title-xs"),
    "body": ("body", "text-"),
}

def load(bundle: Path):
    html = (bundle / "reference.html").read_text(encoding="utf-8", errors="replace")
    css = "\n".join(
        p.read_text(encoding="utf-8", errors="replace")
        for p in sorted((bundle / "assets").glob("*.css"))
    )
    return html, css


def norm_color(value: str):
    v = value.strip().lower()
    if v in ("transparent", "currentcolor", "inherit", "none"):
        return None
    if v.startswith("#"):
        if len(v) in (4, 5):  # #abc → #aabbcc… (keep alpha channels intact)
            v = "#" + "".join(ch * 2 for ch in v[1:])
        return v
    return v


def rule_iter(css: str):
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
        yield m.group(1).strip(), m.group(2)


def count_props(css: str, prop_re, value_filter=None):
    counts = Counter()
    for _, body in rule_iter(css):
        for m in prop_re.finditer(body):
            v = m.group(1).strip().rstrip(";").strip()
            if v and len(v) < 140 and (value_filter is None or value_filter(v)):
                counts[v] += 1
    return counts


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    bundle = Path(sys.argv[1])
    _, css = load(bundle)

    # ── colors ────────────────────────────────────────────────────────────
    hex_counts, rgb_counts = Counter(), Counter()
    color_ctx = defaultdict(Counter)
    for sel, body in rule_iter(css):
        sel_tail = sel.split(",")[-1].strip().split()[-1][:40] if sel.strip() else "?"
        for m in HEX_RE.finditer(body):
            c = norm_color(m.group(0))
            if c:
                hex_counts[c] += 1
                color_ctx[c][sel_tail] += 1
        for m in RGB_RE.finditer(body):
            c = norm_color(m.group(0))
            if c:
                rgb_counts[c] += 1
                color_ctx[c][sel_tail] += 1

    palette = []
    seen = set()

    def is_transparent(c: str) -> bool:
        if re.fullmatch(r"#[0-9a-fA-F]{6}00", c):
            return True
        m = re.fullmatch(r"rgba?\([^)]*?,\s*0\s*\)", c)
        return bool(m)

    for counts, kind in ((hex_counts, "hex"), (rgb_counts, "rgba")):
        for c, n in counts.most_common(24):
            if c in seen or is_transparent(c) or c in ("unset", "inherit"):
                continue
            seen.add(c)
            alpha = "alpha variant" if c.startswith("rgba") else ""
            palette.append({
                "value": c,
                "usage": f"{n} declaration(s){', ' + alpha if alpha else ''}; top contexts: " + ", ".join(s for s, _ in color_ctx[c].most_common(4)),
                "source": "captured stylesheets",
                "group": "surface" if n >= 40 else ("brand" if n >= 10 else ("text" if n >= 4 else "other")),
            })

    # ── typography: rules with a size → role mapping ──────────────────────
    sized_rules = []
    for sel, body in rule_iter(css):
        sz = SIZE_RE.search(body)
        if not sz:
            continue
        fam = FONT_RE.search(body)
        wt = WEIGHT_RE.search(body)
        sized_rules.append({
            "sel": sel.lower()[:120],
            "size": sz.group(1).strip().rstrip(";"),
            "family": fam.group(1).strip() if fam else None,
            "weight": int(wt.group(1)) if wt else None,
        })

    def px_of(size: str):
        m = re.search(r"([\d.]+)\s*(px|rem)", size)
        if not m:
            return 0.0
        val = float(m.group(1))
        return val if m.group(2) == "px" else val * 16.0

    role_map = defaultdict(list)
    for r in sized_rules:
        for role, keys in ROLE_KEYS.items():
            if role in r["sel"] or any(k in r["sel"] for k in keys):
                role_map[role].append(r)
                break
    if "body" not in role_map:
        role_map["body"] = [r for r in sized_rules if px_of(r["size"]) <= 20] or sized_rules[-3:]

    families = Counter()
    for m in FONT_RE.finditer(css):
        v = m.group(1).strip().rstrip(";")
        first = v.split(",")[0].strip().strip("'\"")
        if first and len(first) < 60:
            families[first] += 1
    top_families = [f for f, _ in families.most_common(3)]
    typographyRoles = {}
    for role in ("display", "h1", "h2", "h3", "h4", "h5", "body"):
        rs = sorted(role_map.get(role, []), key=lambda r: -px_of(r["size"]))
        if not rs:
            continue
        best = rs[0]
        typographyRoles[role] = {
            "fontFamily": best["family"],
            "fontSize": best["size"],
            "fontWeight": best["weight"],
        }
    # display fallback: the largest measured text rule anywhere becomes display
    if "display" not in typographyRoles and sized_rules:
        biggest = max(sized_rules, key=lambda r: px_of(r["size"]))
        if px_of(biggest["size"]) > px_of(typographyRoles.get("h1", {}).get("fontSize", "0px")):
            typographyRoles["display"] = {
                "fontFamily": biggest["family"],
                "fontSize": biggest["size"],
                "fontWeight": biggest["weight"],
            }
    # family fallback: heading roles inherit the largest heading family; body
    # inherits the most common family in the stylesheet (the body face)
    heading_fam = next(
        (typographyRoles[r]["fontFamily"] for r in ("display", "h1", "h2", "h3") if typographyRoles.get(r, {}).get("fontFamily")),
        None,
    )
    body_fam = families.most_common(1)[0][0] if families else None
    for role, t in typographyRoles.items():
        if not t.get("fontFamily"):
            t["fontFamily"] = heading_fam if role != "body" and heading_fam else body_fam


    # ── shapes / spacing / elevation / layout / breakpoints ───────────────
    radii = count_props(css, RADIUS_RE, lambda v: v not in ("0", "0px"))
    shadows = count_props(css, SHADOW_RE)
    space_counts = Counter()
    for _, body in rule_iter(css):
        for m in SPACE_RE.finditer(body):
            v = m.group(2).strip().rstrip(";").strip()
            if v and len(v) < 40 and re.search(r"\d", v):
                space_counts[v] += 1
    containers = sorted({f"{w}px" for w in MAXW_RE.findall(css)}, key=lambda s: -int(s[:-2]))[:6]
    breakpoints = sorted({f"{w}px" for w in MEDIA_RE.findall(css)}, key=lambda s: -int(s[:-2]))

    # motion: keyframe names + animated/transition properties (measured)
    kf_names = sorted({m.group(1).strip() for m in re.finditer(r"@keyframes\s+([\w-]+)", css)})
    trans_props = Counter()
    for m in re.finditer(r"transition(?:-property)?\s*:\s*([^;}]+)", css, re.I):
        v = m.group(1).strip().rstrip(";").strip()
        if v and len(v) < 60:
            trans_props[v] += 1
    motion_facts = []
    if kf_names:
        motion_facts.append({
            "text": f"{len(kf_names)} @keyframes animations measured: " + ", ".join(kf_names[:10]),
            "source": "captured stylesheets (@keyframes declarations)",
        })
    if trans_props:
        motion_facts.append({
            "text": "Transition properties measured: " + ", ".join(f"{k} ({n})" for k, n in trans_props.most_common(6)),
            "source": "captured stylesheets (transition declarations)",
        })

    dos, donts = [], []
    if radii:
        dos.append("Use the measured radius scale — radii are measured on real containers, not assumed.")
    else:
        dos.append("Hard edges throughout — no border-radius declarations exist in the captured CSS.")
        donts.append("Do not add soft rounded cards; the reference is hard-edged.")
    if shadows:
        donts.append("Reserve shadows for measured elevated elements only; the reference is otherwise flat.")
    else:
        dos.append("Flat surfaces — no box-shadow declarations exist; hairline rules separate sections.")

    doc = {
        "measuredAt": None,  # stamped by the backfill caller
        "colorTokens": {},
        "typographyRoles": typographyRoles,
        "palette": palette[:16],
        "typography": [{
            "text": f"Primary families: {', '.join(top_families)}",
            "source": "captured stylesheets",
        }],
        "motion": motion_facts,
        "layout": ([f"Measured container widths: {', '.join(containers)}"] if containers else []),
        "spacing": dict(space_counts.most_common(12)),
        "elevation": dict(shadows.most_common(6)),
        "rounded": dict(radii.most_common(8)),
        "responsive": [
            {"name": f"bp{i + 1}", "width": w, "changes": "media-query boundary (declarations not analyzed per-boundary)",
             "source": "captured stylesheets"}
            for i, w in enumerate(breakpoints)
        ],
        "dos": dos,
        "donts": donts,
        "gaps": [
            "Computed (rendered) styles were not sampled — values come from static stylesheets; the rendered cascade may differ.",
            "Typography role names are inferred from selector names and size ordering, not from rendered headings.",
            "Component inventory was not derived — no named component token maps in this pass.",
        ],
        "sources": ["captured stylesheets (assets/*.css) + reference.html of the capture bundle"],
    }
    print(json.dumps(doc, indent=2))


if __name__ == "__main__":
    main()
