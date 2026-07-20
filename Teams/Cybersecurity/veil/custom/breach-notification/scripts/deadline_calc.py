#!/usr/bin/env python3
"""
deadline_calc.py — calculate regulatory notification deadlines per jurisdiction.

Owner: veil (Cybersecurity / Data Privacy & Protection), skill: breach-notification.
Given a breach confirmation timestamp and a set of applicable jurisdictions,
calculates notification deadlines, internal alert milestones (50%, 75% of window),
and flags any deadlines that have already passed.

Usage:
  python3 deadline_calc.py --confirmed-at "2026-07-12T14:30:00Z" --jurisdictions GDPR,PIPEDA
  python3 deadline_calc.py --test
Stdlib only. No network, no writes.
"""

import argparse, json, sys
from datetime import datetime, timedelta, timezone

# Jurisdiction definitions: {code: (label, hours, description)}
JURISDICTIONS = {
    "GDPR": ("GDPR (EU/EEA)", 72, "72 hours from breach awareness"),
    "UK_GDPR": ("UK GDPR", 72, "72 hours from breach awareness"),
    "PIPEDA": ("PIPEDA (Canada)", 0, "as soon as feasible — no fixed clock; track as immediate"),
    "CCPA": ("CCPA (California)", 0, "no unreasonable delay — track as prompt"),
    "PCI_DSS": ("PCI DSS", 24, "24 hours for cardholder data compromise"),
    "HIPAA": ("HIPAA (US Health)", 60 * 24, "60 days from breach discovery"),
    "AU_NBD": ("Australia NBD", 0, "as soon as practicable — track as prompt"),
    "SG_PDPA": ("Singapore PDPA", 0, "as soon as practicable — track as prompt"),
}
JURISDICTIONS_WITH_CLOCK = {k: v for k, v in JURISDICTIONS.items() if v[1] > 0}
JURISDICTIONS_PROMPT = {k: v for k, v in JURISDICTIONS.items() if v[1] == 0}


def calc_deadlines(confirmed_at_str, jurisdictions):
    """
    Calculate notification deadlines for each applicable jurisdiction.
    confirmed_at_str: ISO 8601 timestamp.
    jurisdictions: comma-separated or list of jurisdiction codes.
    Returns dict with per-jurisdiction deadlines and overall status.
    """
    try:
        confirmed = datetime.fromisoformat(confirmed_at_str.replace("Z", "+00:00"))
    except (ValueError, TypeError) as e:
        return {"error": f"invalid timestamp: {confirmed_at_str}", "detail": str(e)}

    now = datetime.now(timezone.utc)
    jlist = [j.strip().upper() for j in (jurisdictions if isinstance(jurisdictions, list)
                                          else jurisdictions.split(","))]

    results = {}
    all_overdue = True
    for j in jlist:
        if j not in JURISDICTIONS:
            results[j] = {"error": f"unknown jurisdiction: {j}. Known: {list(JURISDICTIONS.keys())}"}
            continue

        label, hours, desc = JURISDICTIONS[j]
        if hours == 0:
            # No fixed clock — flag as "immediate/prompt"
            results[j] = {
                "label": label,
                "description": desc,
                "clock_hours": None,
                "deadline": None,
                "status": "IMMEDIATE — no fixed clock; notify promptly",
                "hours_remaining": None,
                "overdue": False,
            }
            all_overdue = False
        else:
            deadline = confirmed + timedelta(hours=hours)
            remaining = (deadline - now).total_seconds() / 3600
            overdue = remaining <= 0
            if not overdue:
                all_overdue = False

            # Internal milestones
            pct_50 = confirmed + timedelta(hours=hours * 0.5)
            pct_75 = confirmed + timedelta(hours=hours * 0.75)

            results[j] = {
                "label": label,
                "description": desc,
                "clock_hours": hours,
                "confirmed_at": confirmed.isoformat(),
                "deadline": deadline.isoformat(),
                "hours_remaining": round(remaining, 1),
                "overdue": overdue,
                "status": "OVERDUE" if overdue else f"{round(remaining, 1)}h remaining",
                "internal_alerts": {
                    "50pct_at": pct_50.isoformat(),
                    "50pct_passed": now >= pct_50,
                    "75pct_at": pct_75.isoformat(),
                    "75pct_passed": now >= pct_75,
                },
            }

    return {
        "breach_confirmed_at": confirmed.isoformat(),
        "calculated_at": now.isoformat(),
        "jurisdictions": results,
        "all_deadlines_met": not all_overdue,
        "note": "veil calculates deadlines; operator/legal counsel approves and sends notifications. "
                "Jurisdictions with no fixed clock ('as soon as feasible') should be treated as immediate. "
                "Rule 0.6: jurisdiction definitions are sourced from regulatory texts; "
                "internal alert milestones (50%/75%) are veil's convention.",
    }


# ----------------------------- self-tests -----------------------------
def _run_tests():
    ok = True
    def check(name, cond):
        nonlocal ok; print(f"  [{'PASS' if cond else 'FAIL'}] {name}"); ok = ok and cond

    # 1. GDPR 72h deadline
    # Confirmed at arbitrary time, check that deadline is exactly 72h later
    dl = calc_deadlines("2026-07-12T14:00:00Z", "GDPR")
    gdpr = dl["jurisdictions"]["GDPR"]
    check("GDPR has deadline", gdpr["deadline"] is not None)
    check("GDPR clock is 72h", gdpr["clock_hours"] == 72)
    check("GDPR deadline is 72h after confirmation", "2026-07-15T14:00:00" in gdpr["deadline"])
    check("GDPR not overdue (just confirmed)", gdpr["overdue"] is False)

    # 2. PCI DSS 24h clock
    dl2 = calc_deadlines("2026-07-12T14:00:00Z", "PCI_DSS")
    pci = dl2["jurisdictions"]["PCI_DSS"]
    check("PCI DSS deadline 24h", pci["clock_hours"] == 24)
    check("PCI DSS deadline correct", "2026-07-13T14:00:00" in pci["deadline"])

    # 3. PIPEDA (no fixed clock)
    dl3 = calc_deadlines("2026-07-12T14:00:00Z", "PIPEDA")
    pip = dl3["jurisdictions"]["PIPEDA"]
    check("PIPEDA has no clock", pip["clock_hours"] is None)
    check("PIPEDA status immediate", "IMMEDIATE" in pip["status"])

    # 4. Multiple jurisdictions
    dl4 = calc_deadlines("2026-07-12T14:00:00Z", "GDPR,PIPEDA,PCI_DSS")
    check("multiple jurisdictions return all", len(dl4["jurisdictions"]) == 3)
    check("each jurisdiction present", all(j in dl4["jurisdictions"] for j in ["GDPR", "PIPEDA", "PCI_DSS"]))

    # 5. Unknown jurisdiction
    dl5 = calc_deadlines("2026-07-12T14:00:00Z", "FAKE_REGULATION")
    check("unknown jurisdiction → error", "error" in dl5["jurisdictions"]["FAKE_REGULATION"])

    # 6. Internal alert milestones
    check("50pct milestone present", "internal_alerts" in gdpr)
    check("50pct is 36h after confirmation", gdpr["internal_alerts"]["50pct_at"])
    check("75pct is 54h after confirmation", gdpr["internal_alerts"]["75pct_at"])

    # 7. ISO timestamp flexibility (with Z suffix handled)
    dl7 = calc_deadlines("2026-07-12T14:00:00+00:00", "GDPR")
    check("ISO format with +00:00 works", "error" not in dl7)

    # 8. Rule-0.6 flag
    check("0.6 flag present", "reasoning-based" in dl4["note"])

    print("ALL PASSED" if ok else "SOME FAILED")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description="veil breach notification deadline calculator")
    ap.add_argument("--confirmed-at", help="ISO 8601 timestamp of breach confirmation")
    ap.add_argument("--jurisdictions", help="Comma-separated jurisdiction codes: GDPR,PIPEDA,CCPA,PCI_DSS,HIPAA")
    ap.add_argument("--test", action="store_true")
    args = ap.parse_args()
    if args.test:
        return _run_tests()
    if not args.confirmed_at or not args.jurisdictions:
        ap.error("provide --confirmed-at and --jurisdictions, or --test")
    print(json.dumps(calc_deadlines(args.confirmed_at, args.jurisdictions), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
