#!/usr/bin/env python3
"""fiduciary_check.py -- deterministic checks for the fiduciary-guard skill.

Computes: approval-gate check, post-spend runway vs floor, ROI vs minimum.
The recommendation mapping (APPROVE/CONDITIONAL/REJECT) is documented in
SKILL.md Phase 4; this script reports check results and computed values.
Judgment stays with the agent.

Input JSON schema (ALL thresholds must be supplied -- no defaults, ever):
{
  "description": "New CRM licenses",          // optional label
  "spend": {
    "amount": 12000,                           // required (one-time cost), or 0 if purely recurring
    "recurring_monthly": 0,                    // optional, default 0 -- added to burn
    "currency": "CAD"                          // optional label, not converted
  },
  "thresholds": {
    "spend_approval_gate": 5000,               // required
    "runway_floor_months": 6,                  // required
    "roi_minimum": 1.5                         // required
  },
  "financials": {
    "cash_on_hand": 120000,                    // required for runway check
    "monthly_burn": 15000                      // required for runway check, > 0
  },
  "expected_return": {                         // optional -- omit if no credible estimate
    "amount": 20000,
    "horizon_months": 12
  }
}

Usage:
  python fiduciary_check.py input.json                 # markdown table
  python fiduciary_check.py input.json --format json

Standard library only.
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

REQUIRED_THRESHOLDS = ("spend_approval_gate", "runway_floor_months", "roi_minimum")


def compute(spec: dict[str, Any]) -> dict[str, Any]:
    thresholds = spec.get("thresholds") or {}
    missing = [k for k in REQUIRED_THRESHOLDS if thresholds.get(k) is None]
    if missing:
        raise ValueError(
            "Missing threshold(s): " + ", ".join(missing)
            + " — thresholds must come from board-config; this script never defaults them."
        )

    spend = spec.get("spend") or {}
    amount = float(spend.get("amount", 0) or 0)
    recurring = float(spend.get("recurring_monthly", 0) or 0)
    if amount < 0 or recurring < 0:
        raise ValueError("spend.amount and spend.recurring_monthly must be >= 0")
    if amount == 0 and recurring == 0:
        raise ValueError("Nothing to review: both amount and recurring_monthly are 0")

    gate = float(thresholds["spend_approval_gate"])
    floor = float(thresholds["runway_floor_months"])
    roi_min = float(thresholds["roi_minimum"])

    # --- Gate check: recurring commitments are annualized for gate comparison ---
    gate_basis = amount + 12 * recurring
    above_gate = gate_basis >= gate

    # --- Runway check ---
    fin = spec.get("financials") or {}
    cash = fin.get("cash_on_hand")
    burn = fin.get("monthly_burn")
    runway = {"result": "NOT_EVALUATED", "reason": "cash_on_hand / monthly_burn not provided"}
    if cash is not None and burn is not None:
        cash = float(cash)
        burn = float(burn)
        if burn <= 0:
            raise ValueError("monthly_burn must be > 0 for a runway check")
        runway_before = cash / burn
        new_burn = burn + recurring
        runway_after = max(0.0, (cash - amount)) / new_burn
        runway = {
            "runway_before_months": round(runway_before, 1),
            "runway_after_months": round(runway_after, 1),
            "floor_months": floor,
            "result": "PASS" if runway_after >= floor else "FAIL",
        }

    # --- ROI check ---
    ret = spec.get("expected_return")
    roi = {"result": "NOT_EVALUATED", "reason": "no expected_return provided"}
    if ret is not None and ret.get("amount") is not None:
        ret_amount = float(ret["amount"])
        horizon = ret.get("horizon_months")
        total_cost = amount + (recurring * float(horizon) if horizon and recurring else 12 * recurring if recurring else 0)
        total_cost = total_cost if total_cost > 0 else amount
        ratio = ret_amount / total_cost if total_cost > 0 else None
        if ratio is None:
            roi = {"result": "NOT_EVALUATED", "reason": "total cost computed as 0"}
        else:
            roi = {
                "expected_return": ret_amount,
                "total_cost_basis": round(total_cost, 2),
                "horizon_months": horizon,
                "roi_ratio": round(ratio, 2),
                "roi_minimum": roi_min,
                "result": "PASS" if ratio >= roi_min else "FAIL",
            }

    checks = {"runway": runway, "roi": roi}
    results = [c["result"] for c in checks.values()]

    if not above_gate:
        summary = "BELOW_GATE"  # no board approval required; log and pass through
    elif "FAIL" in results:
        summary = "CHECKS_FAILED"      # maps to REJECT recommendation
    elif "NOT_EVALUATED" in results:
        summary = "DATA_INCOMPLETE"    # maps to CONDITIONAL recommendation
    else:
        summary = "CHECKS_PASSED"      # maps to APPROVE recommendation

    return {
        "description": spec.get("description"),
        "gate": {
            "one_time_amount": amount,
            "recurring_monthly": recurring,
            "gate_basis_annualized": round(gate_basis, 2),
            "spend_approval_gate": gate,
            "above_gate": above_gate,
        },
        "checks": checks,
        "summary": summary,
    }


def _fmt(v: Any) -> str:
    return "—" if v is None else str(v)


def render_markdown(out: dict[str, Any]) -> str:
    g = out["gate"]
    r = out["checks"]["runway"]
    roi = out["checks"]["roi"]
    lines = [
        f"## Fiduciary Check: {out.get('description') or '(unlabeled spend)'}",
        "",
        "| Check | Value | Threshold | Result |",
        "|---|---|---|---|",
        f"| Approval gate (annualized basis) | {g['gate_basis_annualized']} | {g['spend_approval_gate']} | "
        f"{'above — full review' if g['above_gate'] else 'below — log only'} |",
    ]
    if r["result"] == "NOT_EVALUATED":
        lines.append(f"| Runway after spend | — | — | NOT_EVALUATED ({r['reason']}) |")
    else:
        lines.append(
            f"| Runway after spend | {r['runway_after_months']} mo "
            f"(was {r['runway_before_months']}) | {r['floor_months']} mo | {r['result']} |"
        )
    if roi["result"] == "NOT_EVALUATED":
        lines.append(f"| Expected ROI | — | — | NOT_EVALUATED ({roi['reason']}) |")
    else:
        lines.append(
            f"| Expected ROI | {roi['roi_ratio']}x on cost basis {roi['total_cost_basis']} | "
            f"{roi['roi_minimum']}x | {roi['result']} |"
        )
    lines += [
        "",
        f"**Computed summary:** {out['summary']}",
        "",
        "_Recommendation mapping (SKILL.md Phase 4): BELOW_GATE → log only · "
        "CHECKS_PASSED → APPROVE · DATA_INCOMPLETE → CONDITIONAL · CHECKS_FAILED → REJECT. "
        "The agent states the reason and conditions; the operator decides._",
    ]
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Fiduciary-guard deterministic checks.")
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
