#!/usr/bin/env python3
"""
incident_timeline.py — build a structured IR timeline from raw event data.

Owner: cortex (Cybersecurity / Security Operations), skill: security-incident-response.
Produces a chronological, structured timeline of incident events with severity,
source, and action taken — for post-incident reviews, regulatory reporting, and
Incident Commander communication templates.

Usage:
  python3 incident_timeline.py --events events.json
  python3 incident_timeline.py --test
Stdlib only. No network, no writes.
"""

import argparse, json, sys
from datetime import datetime, timezone

REQUIRED_KEYS = {"timestamp", "event_type", "description"}


def build_timeline(events, sort=True):
    """
    Parse and validate a list of event dicts, produce structured timeline.
    Each event: {timestamp: ISO8601, event_type: str, description: str,
                 severity: (optional) str, source: (optional) str,
                 action_taken: (optional) str}
    """
    validated = []
    errors = []
    for i, ev in enumerate(events):
        missing = REQUIRED_KEYS - set(ev.keys())
        if missing:
            errors.append({"index": i, "event": ev.get("event_type", f"event_{i}"),
                           "error": f"missing keys: {missing}"})
            continue
        try:
            dt = datetime.fromisoformat(ev["timestamp"])
        except (ValueError, TypeError):
            errors.append({"index": i, "event": ev.get("event_type", f"event_{i}"),
                           "error": f"invalid timestamp: {ev.get('timestamp')}"})
            continue
        validated.append({
            "timestamp": ev["timestamp"],
            "datetime_utc": dt.astimezone(timezone.utc).isoformat(),
            "event_type": ev["event_type"],
            "description": ev["description"],
            "severity": ev.get("severity", "UNSPECIFIED"),
            "source": ev.get("source", "unknown"),
            "action_taken": ev.get("action_taken", "none"),
        })

    if sort:
        validated.sort(key=lambda e: e["timestamp"])

    # Generate summary
    sev_counts = {}
    for e in validated:
        sev_counts[e["severity"]] = sev_counts.get(e["severity"], 0) + 1

    first = validated[0]["timestamp"] if validated else None
    last = validated[-1]["timestamp"] if validated else None

    return {
        "timeline": validated,
        "total_events": len(validated),
        "errors": errors,
        "severity_breakdown": sev_counts,
        "time_range": {"first_event": first, "last_event": last},
        "note": "cortex builds timeline; operator/incident commander uses for review and reporting.",
    }


# ----------------------------- self-tests -----------------------------
def _run_tests():
    ok = True
    def check(name, cond):
        nonlocal ok; print(f"  [{'PASS' if cond else 'FAIL'}] {name}"); ok = ok and cond

    # 1. Valid events build correctly
    events = [
        {"timestamp": "2026-07-12T14:30:00Z", "event_type": "ALERT",
         "description": "EDR alert:可疑进程创建", "severity": "HIGH",
         "source": "elastic", "action_taken": "triaged"},
        {"timestamp": "2026-07-12T14:25:00Z", "event_type": "DETECTION",
         "description": "Detection rule fired: ransomware behavior", "severity": "CRITICAL",
         "source": "elastic", "action_taken": "paged"},
    ]
    tl = build_timeline(events)
    check("sorts chronologically", tl["timeline"][0]["timestamp"] == "2026-07-12T14:25:00Z")
    check("correct event count", tl["total_events"] == 2)
    check("severity breakdown", tl["severity_breakdown"]["CRITICAL"] == 1)
    check("time range first", tl["time_range"]["first_event"] == "2026-07-12T14:25:00Z")

    # 2. Missing required keys → error
    bad = [{"timestamp": "2026-07-12T14:30:00Z", "event_type": "ALERT"}]  # missing description
    tl2 = build_timeline(bad)
    check("missing key → error", len(tl2["errors"]) == 1)
    check("error contains missing key", "missing keys" in tl2["errors"][0]["error"])

    # 3. Invalid timestamp → error
    bad_ts = [{"timestamp": "not-a-date", "event_type": "ALERT", "description": "test"}]
    tl3 = build_timeline(bad_ts)
    check("invalid timestamp → error", len(tl3["errors"]) == 1)

    # 4. Empty events list
    tl4 = build_timeline([])
    check("empty events → no errors", len(tl4["errors"]) == 0)
    check("empty events → count 0", tl4["total_events"] == 0)

    # 5. Optional fields default correctly
    minimal = [{"timestamp": "2026-07-12T15:00:00Z", "event_type": "NOTE",
                "description": "Investigation started"}]
    tl5 = build_timeline(minimal)
    check("optional severity defaults", tl5["timeline"][0]["severity"] == "UNSPECIFIED")
    check("optional source defaults", tl5["timeline"][0]["source"] == "unknown")
    check("optional action defaults", tl5["timeline"][0]["action_taken"] == "none")

    # 6. UTC conversion preserves time
    tz_events = [{"timestamp": "2026-07-12T10:00:00-04:00", "event_type": "ALERT",
                  "description": "EDR alert EDT"}]
    tl6 = build_timeline(tz_events)
    check("EDT converts to UTC", "2026-07-12T14:00:00" in tl6["timeline"][0]["datetime_utc"])

    print("ALL PASSED" if ok else "SOME FAILED")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description="cortex IR timeline builder")
    ap.add_argument("--events", help="JSON file: [{timestamp, event_type, description, ...}]")
    ap.add_argument("--test", action="store_true")
    args = ap.parse_args()
    if args.test:
        return _run_tests()
    if not args.events:
        ap.error("provide --events or --test")
    with open(args.events) as f:
        print(json.dumps(build_timeline(json.load(f)), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
