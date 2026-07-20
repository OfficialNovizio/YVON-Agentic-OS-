#!/usr/bin/env python3
"""roadmap_sync.py -- compute roadmap drift, classify items, render the table.

Part of the roadmap-sync skill (vista, Executive Office). Deterministic layer:
slip computation, status classification, and table rendering. Recommendations
(cut/defer/accelerate) are the agent's job, not this script's.

Input JSON schema:
{
  "scope": "Q3 roadmap",             // optional label
  "current_sprint": 4,               // optional, shown in header
  "sprints_in_quarter": 6,           // optional, shown in header
  "flag_threshold": 2,               // optional, default 2 (sprints of slip)
  "items": [
    {
      "name": "Checkout revamp",     // required
      "committed_sprint": 3,         // required unless status_override
      "projected_sprint": 5,         // required unless unknown/percent-only
      "percent_complete": 60,        // optional, context only -- never scored
      "nsm_input": "Publisher rate", // optional
      "rice_score": 2000,            // optional
      "unknown": true                // optional -- no reliable actuals
    }
  ]
}

Classification:
  unknown          -> "unknown"  (no reliable actuals; never defaulted to on-track)
  slip <= 0        -> "on-track"
  slip == 1        -> "watch"
  slip >= threshold-> "flagged"
  1 < slip < threshold (only when threshold > 2) -> "watch"

Usage:
  python roadmap_sync.py input.json                # markdown table
  python roadmap_sync.py input.json --format json  # machine-readable
  python roadmap_sync.py input.json --out out.md   # write to file

Standard library only.
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

DEFAULT_THRESHOLD = 2
STATUS_ORDER = {"flagged": 0, "unknown": 1, "watch": 2, "on-track": 3}


def classify(slip: int | None, unknown: bool, threshold: int) -> str:
    if unknown or slip is None:
        return "unknown"
    if slip >= threshold:
        return "flagged"
    if slip >= 1:
        return "watch"
    return "on-track"


def compute(spec: dict[str, Any]) -> dict[str, Any]:
    threshold = int(spec.get("flag_threshold", DEFAULT_THRESHOLD))
    if threshold < 1:
        raise ValueError("flag_threshold must be >= 1")

    results = []
    for i, item in enumerate(spec.get("items", []), 1):
        name = item.get("name")
        if not name:
            raise ValueError(f"Item #{i} missing 'name'")

        unknown = bool(item.get("unknown", False))
        committed = item.get("committed_sprint")
        projected = item.get("projected_sprint")

        slip: int | None = None
        if not unknown:
            if committed is None:
                raise ValueError(f"Item '{name}' missing 'committed_sprint'")
            if projected is None:
                # no projection and not marked unknown -> data gap, treat as unknown
                unknown = True
            else:
                slip = int(projected) - int(committed)

        results.append(
            {
                "name": name,
                "committed_sprint": committed,
                "projected_sprint": projected,
                "slip": slip,
                "percent_complete": item.get("percent_complete"),
                "nsm_input": item.get("nsm_input"),
                "rice_score": item.get("rice_score"),
                "status": classify(slip, unknown, threshold),
            }
        )

    results.sort(key=lambda r: (STATUS_ORDER[r["status"]], -(r["slip"] or 0)))

    return {
        "scope": spec.get("scope"),
        "current_sprint": spec.get("current_sprint"),
        "sprints_in_quarter": spec.get("sprints_in_quarter"),
        "flag_threshold": threshold,
        "counts": {
            s: sum(1 for r in results if r["status"] == s)
            for s in ("flagged", "watch", "on-track", "unknown")
        },
        "items": results,
    }


def _fmt(v: Any) -> str:
    return "—" if v is None else str(v)


def render_markdown(out: dict[str, Any]) -> str:
    hdr_bits = []
    if out.get("scope"):
        hdr_bits.append(str(out["scope"]))
    if out.get("current_sprint") is not None:
        sprint = f"sprint {out['current_sprint']}"
        if out.get("sprints_in_quarter") is not None:
            sprint += f" of {out['sprints_in_quarter']}"
        hdr_bits.append(sprint)
    header = " — ".join(hdr_bits) if hdr_bits else "Roadmap Sync"

    c = out["counts"]
    lines = [
        f"## Roadmap Sync: {header}",
        "",
        f"Flag threshold: {out['flag_threshold']} sprints. "
        f"Flagged: {c['flagged']} · Watch: {c['watch']} · "
        f"On-track: {c['on-track']} · Unknown: {c['unknown']}",
        "",
        "| Item | Committed | Projected | Slip | % done | Status | NSM input | RICE |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for r in out["items"]:
        lines.append(
            f"| {r['name']} | {_fmt(r['committed_sprint'])} | "
            f"{_fmt(r['projected_sprint'])} | {_fmt(r['slip'])} | "
            f"{_fmt(r['percent_complete'])} | **{r['status']}** | "
            f"{_fmt(r['nsm_input'])} | {_fmt(r['rice_score'])} |"
        )

    flagged = [r["name"] for r in out["items"] if r["status"] == "flagged"]
    unknowns = [r["name"] for r in out["items"] if r["status"] == "unknown"]
    if flagged:
        lines += ["", "**Flagged (needs cut/defer/accelerate options):** "
                  + ", ".join(flagged)]
    if unknowns:
        lines += ["", "**Unknowns (data gaps to close, not passes):** "
                  + ", ".join(unknowns)]
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Compute roadmap drift table.")
    p.add_argument("input", help="Path to input JSON")
    p.add_argument("--format", choices=["markdown", "json"], default="markdown")
    p.add_argument("--out", help="Write output to file instead of stdout")
    args = p.parse_args(argv)

    try:
        with open(args.input, "r", encoding="utf-8") as f:
            spec = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: input file not found: {args.input}", file=sys.stderr)
        return 2
    except json.JSONDecodeError as e:
        print(f"ERROR: invalid JSON: {e}", file=sys.stderr)
        return 2

    try:
        out = compute(spec)
    except (ValueError, TypeError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2

    rendered = (
        json.dumps(out, indent=2) if args.format == "json" else render_markdown(out)
    )
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(rendered + "\n")
    else:
        print(rendered)
    return 0


if __name__ == "__main__":
    sys.exit(main())
