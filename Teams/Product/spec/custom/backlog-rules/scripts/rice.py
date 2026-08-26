#!/usr/bin/env python3
"""rice.py — RICE backlog scoring with spec's evidence-cap policy layer.

CONSOLIDATED 2026-07-29: this file was refactored to a thin wrapper per
playbook §13.5 refined. RICE arithmetic + tie-breaking + confidence
labels now come from `Shared OS/logical/rice_prioritization.py` (the
canonical book-grounded library — Intercom 2014 + Reinertsen 2009).

This wrapper keeps only spec/backlog-rules AGENT-SPECIFIC POLICY:
  - Evidence-cap rule (§3 of backlog-rules): confidence CAPPED at
    EVIDENCE_CAP (0.5) when evidence_level ≤ 2 (opinion / stated
    preference). Optimism cannot outrank evidence.
  - Backlog-item JSON format (id · title · reach · impact · confidence
    · effort · evidence_level).
  - Ranked-print output.

Usage: python rice.py <items.json>

items.json:
[
  {"id": "BL-1", "title": "...", "reach": 400, "impact": 2, "confidence": 0.8,
   "effort": 3, "evidence_level": 4},
  ...
]
"""
import json
import os
import sys

# Import canonical Shared OS math library.
# Resolve path from this file's location — Teams/Product/spec/custom/backlog-rules/scripts/
_HERE = os.path.dirname(os.path.abspath(__file__))
_SHARED_OS = os.path.abspath(os.path.join(_HERE, "..", "..", "..", "..", "..", "Shared OS", "logical"))
if _SHARED_OS not in sys.path:
    sys.path.insert(0, _SHARED_OS)
import rice_prioritization  # noqa: E402


VALID_IMPACT = {0.25, 0.5, 1.0, 2.0, 3.0}
EVIDENCE_CAP = 0.5   # confidence cap when evidence_level <= CAP_LEVEL
CAP_LEVEL = 2


def score(item):
    """Spec's evidence-capped RICE score.

    Validation + evidence-cap policy owned here; RICE arithmetic delegated
    to Shared OS/logical/rice_prioritization.rice_score().
    """
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

    # AGENT-SPECIFIC POLICY: evidence cap
    conf = item["confidence"]
    capped = False
    if item["evidence_level"] <= CAP_LEVEL and conf > EVIDENCE_CAP:
        conf, capped = EVIDENCE_CAP, True

    # Delegate arithmetic to Shared OS canonical (RICE = R×I×C/E)
    rice_result = rice_prioritization.rice_score(
        reach=item["reach"],
        impact=item["impact"],
        confidence=conf,
        effort=item["effort"],
    )
    rice_val = rice_result["rice"] if isinstance(rice_result, dict) else rice_result

    return {
        "id": item["id"],
        "title": item.get("title", ""),
        "rice": round(rice_val, 1),
        "confidence_used": conf,
        "capped_by_evidence": capped,
        "source": "Shared OS/logical/rice_prioritization.rice_score",
    }, []


def main():
    if len(sys.argv) < 2 or sys.argv[1] == "--test":
        return _self_tests()
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
    print("# RICE ranking — evidence-capped per backlog-rules §3; RICE math via Shared OS/logical/rice_prioritization")
    for i, r in enumerate(results, 1):
        cap = " (confidence CAPPED by evidence level)" if r["capped_by_evidence"] else ""
        print(f"{i}. {r['id']} rice={r['rice']} conf={r['confidence_used']}{cap} {r['title']}")
    return 2 if bad else 0


def _self_tests():
    # Test 1: high evidence — no cap applied
    r, errs = score({"id": "T1", "reach": 100, "impact": 2, "confidence": 0.9, "effort": 2, "evidence_level": 4})
    assert not errs and r["rice"] == 90.0 and not r["capped_by_evidence"], r
    print("[PASS] high evidence, confidence uncapped")

    # Test 2: low evidence — cap engages
    r, errs = score({"id": "T2", "reach": 100, "impact": 2, "confidence": 0.9, "effort": 2, "evidence_level": 1})
    assert not errs and r["capped_by_evidence"] and r["confidence_used"] == 0.5, r
    print(f"[PASS] low evidence (level=1) → confidence capped at {EVIDENCE_CAP}")

    # Test 3: invalid impact rejected
    r, errs = score({"id": "T3", "reach": 100, "impact": 1.5, "confidence": 0.5, "effort": 2, "evidence_level": 4})
    assert errs and any("impact" in e for e in errs), errs
    print("[PASS] invalid impact rejected")

    # Test 4: RICE math matches Shared OS canonical
    from rice_prioritization import rice_score as canonical
    c = canonical(reach=100, impact=2, confidence=0.9, effort=2)
    assert c["rice"] == 90.0, c
    print(f"[PASS] Shared OS math verified: RICE(100,2,0.9,2) = {c['rice']}")

    print("[PASS] rice.py wrapper delegates to Shared OS/logical/rice_prioritization")
    return 0


if __name__ == "__main__":
    sys.exit(main())
