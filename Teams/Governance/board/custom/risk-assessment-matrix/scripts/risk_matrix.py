#!/usr/bin/env python3
"""risk_matrix.py -- deterministic P×I scoring for the risk-assessment-matrix skill.

Computes probability × impact per risk, applies the mitigation gate, checks
gated risks for mitigation plan + owner, and derives the ruling. Identifying
risks and judging scores stays with the agent/operator.

Input JSON schema:
{
  "decision": "Sign the 24-month office lease",   // optional label
  "mitigation_gate": 12,                           // optional, default 12 (catalog protocol)
  "risks": [
    {
      "name": "Headcount growth stalls; space sits unused",  // required
      "probability": 3,                                       // required, int 1-5
      "impact": 4,                                            // required, int 1-5
      "basis": "hiring plan already 2 behind",                // optional
      "guessed": false,                                       // optional -- true = score is a pure guess
      "mitigation": "sublease clause negotiated",             // required for gated risks to PASS
      "owner": "operator",                                    // required for gated risks to PASS
      "review_date": "2026-10-01"                             // optional but recommended
    }
  ]
}

Ruling:
  PASS                   -- no risk at/above the gate
  PASS_WITH_MITIGATIONS  -- gated risks exist, all have mitigation + owner
  HOLD                   -- any gated risk missing mitigation or owner

Usage:
  python risk_matrix.py input.json                 # markdown matrix
  python risk_matrix.py input.json --format json

Standard library only.
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

DEFAULT_GATE = 12


def compute(spec: dict[str, Any]) -> dict[str, Any]:
    gate = int(spec.get("mitigation_gate", DEFAULT_GATE))
    if not (2 <= gate <= 25):
        raise ValueError("mitigation_gate must be between 2 and 25")

    risks_in = spec.get("risks") or []
    if not risks_in:
        raise ValueError(
            "No risks provided. An empty matrix is not a PASS — "
            "identify risks (run pre-mortem for major decisions) before scoring."
        )

    rows = []
    for i, r in enumerate(risks_in, 1):
        name = r.get("name")
        if not name:
            raise ValueError(f"Risk #{i} missing 'name'")
        p = r.get("probability")
        imp = r.get("impact")
        for label, v in (("probability", p), ("impact", imp)):
            if not isinstance(v, int) or not (1 <= v <= 5):
                raise ValueError(f"Risk '{name}': {label} must be an integer 1-5, got {v!r}")

        score = p * imp
        gated = score >= gate
        has_mitigation = bool((r.get("mitigation") or "").strip())
        has_owner = bool((r.get("owner") or "").strip())
        rows.append(
            {
                "name": name,
                "probability": p,
                "impact": imp,
                "score": score,
                "gated": gated,
                "guessed": bool(r.get("guessed", False)),
                "basis": r.get("basis"),
                "mitigation": r.get("mitigation"),
                "owner": r.get("owner"),
                "review_date": r.get("review_date"),
                "mitigation_complete": (has_mitigation and has_owner) if gated else None,
            }
        )

    rows.sort(key=lambda x: -x["score"])
    gated_rows = [r for r in rows if r["gated"]]
    unmitigated = [r["name"] for r in gated_rows if not r["mitigation_complete"]]

    if not gated_rows:
        ruling = "PASS"
    elif unmitigated:
        ruling = "HOLD"
    else:
        ruling = "PASS_WITH_MITIGATIONS"

    return {
        "decision": spec.get("decision"),
        "mitigation_gate": gate,
        "counts": {
            "total": len(rows),
            "gated": len(gated_rows),
            "gated_unmitigated": len(unmitigated),
            "guessed_scores": sum(1 for r in rows if r["guessed"]),
        },
        "unmitigated_gated_risks": unmitigated,
        "ruling": ruling,
        "risks": rows,
    }


def _fmt(v: Any) -> str:
    return "—" if v in (None, "") else str(v)


def render_markdown(out: dict[str, Any]) -> str:
    lines = [
        f"## Risk Assessment: {out.get('decision') or '(unlabeled decision)'}",
        "",
        f"Mitigation gate: P×I ≥ {out['mitigation_gate']} · "
        f"Risks: {out['counts']['total']} · Gated: {out['counts']['gated']} · "
        f"Gated without plan/owner: {out['counts']['gated_unmitigated']}",
        "",
        "| Risk | P | I | P×I | Gated | Basis | Mitigation | Owner | Review |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    for r in out["risks"]:
        name = r["name"] + (" *(guessed score)*" if r["guessed"] else "")
        lines.append(
            f"| {name} | {r['probability']} | {r['impact']} | **{r['score']}** | "
            f"{'YES' if r['gated'] else 'no'} | {_fmt(r['basis'])} | "
            f"{_fmt(r['mitigation'])} | {_fmt(r['owner'])} | {_fmt(r['review_date'])} |"
        )

    lines += ["", f"### Ruling: {out['ruling']}"]
    if out["ruling"] == "HOLD":
        lines.append(
            "Gated risk(s) missing mitigation plan and/or owner: "
            + ", ".join(out["unmitigated_gated_risks"])
            + ". HOLD converts to PASS_WITH_MITIGATIONS once plans + owners exist."
        )
    if out["counts"]["guessed_scores"]:
        lines.append(
            f"\n_{out['counts']['guessed_scores']} score(s) flagged as guesses — "
            "labeled per the no-fabrication principle; firm up before relying on the ranking._"
        )
    lines.append(
        "\n_Rubric-based scoring (P×I, anchored 1–5 scales), not statistically grounded — "
        "flagged per playbook rule 0.6 until board's logical layer has a real risk-theory source._"
    )
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Risk-assessment-matrix P×I scoring.")
    p.add_argument("input", help="Path to input JSON")
    p.add_argument("--format", choices=["markdown", "json"], default="markdown")
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

    print(json.dumps(out, indent=2) if args.format == "json" else render_markdown(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
