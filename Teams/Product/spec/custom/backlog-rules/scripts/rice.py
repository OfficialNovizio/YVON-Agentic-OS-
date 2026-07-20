#!/usr/bin/env python3
"""rice.py — RICE backlog scoring (spec / backlog-rules).

Usage: python rice.py <items.json>

items.json:
[
  {"id": "BL-1", "title": "...", "reach": 400, "impact": 2, "confidence": 0.8,
   "effort": 3, "evidence_level": 4},
  ...
]
Fields: reach = people/period (cite metric's data); impact = 0.25/0.5/1/2/3 (Intercom-style
rubric); confidence = 0..1; effort = person-months > 0 (Engineering's estimate, never spec's);
evidence_level = validation ladder 1-5 (loom's shared ladder).

Rule: confidence is CAPPED at EVIDENCE_CAP for evidence_level <= 2 (opinion/stated preference)
— optimism cannot outrank evidence (backlog-rules §3). Cap default 0.5, override via config.

RICE is a RUBRIC: output is flagged reasoning-based, not formula-verified (rule 0.6) until the
logical layer grounds the weights. Exit 0 on success, 2 on data errors.
"""
import json
import sys

VALID_IMPACT = {0.25, 0.5, 1.0, 2.0, 3.0}
EVIDENCE_CAP = 0.5   # confidence cap when evidence_level <= 2; suggested default, config-overridable
CAP_LEVEL = 2


def score(item):
    errs = []
    for f in ("id", "reach", "impact", "confidence", "effort", "evidence_level"):
        if f not in item:
            errs.append(f"missing '{f}'")
    if errs:
        return None, errs
    if item["impact"] not in VALID_IMPACT:
        errs.append(f"impact {item['impact']} not in rubric {sorted(VALID_IMPACT)}")
    if not (0 <= item["confidence"] <= 1):
        errs.append("confidence outside 0..1")
    if item["effort"] <= 0:
        errs.append("effort must be > 0")
    if errs:
        return None, errs
    conf = item["confidence"]
    capped = False
    if item["evidence_level"] <= CAP_LEVEL and conf > EVIDENCE_CAP:
        conf, capped = EVIDENCE_CAP, True
    rice = item["reach"] * item["impact"] * conf / item["effort"]
    return {"id": item["id"], "title": item.get("title", ""), "rice": round(rice, 1),
            "confidence_used": conf, "capped_by_evidence": capped}, []


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    with open(sys.argv[1]) as f:
        items = json.load(f)
    results, bad = [], False
    for item in items:
        r, errs = score(item)
        if errs:
            print(f"ERROR {item.get('id', '?')}: " + "; ".join(errs))
            bad = True
        else:
            results.append(r)
    results.sort(key=lambda r: -r["rice"])
    print("# RICE ranking — [reasoning-based, not formula-verified] (rule 0.6; rubric weights ungrounded)")
    for i, r in enumerate(results, 1):
        cap = " (confidence CAPPED by evidence level)" if r["capped_by_evidence"] else ""
        print(f"{i}. {r['id']} rice={r['rice']} conf={r['confidence_used']}{cap} {r['title']}")
    return 2 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
