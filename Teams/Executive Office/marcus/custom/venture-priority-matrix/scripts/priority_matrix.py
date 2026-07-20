#!/usr/bin/env python3
"""
priority_matrix.py — weighted scoring & ranking engine for the venture-priority-matrix skill.

Scores competing initiatives (ventures, departments, projects — any comparable unit of work)
across six factors and produces a ranked priority list, so resource-allocation calls are
based on a consistent, auditable method instead of ad hoc judgment.

Usage:
    python priority_matrix.py input.json [--weights weights.json] [--out ranked.json]

Input JSON format: a list of initiatives, each an object with:
    {
        "name": "Initiative name",
        "revenue_impact": 1-5,     # benefit factor — higher is better
        "strategic_fit": 1-5,      # benefit factor — higher is better
        "runway_effect": 1-5,      # benefit factor — higher is better (extends runway more)
        "time_to_impact": 1-5,     # benefit factor — higher = faster results
        "resourcing_cost": 1-5,    # cost factor — higher = more expensive
        "risk": 1-5,               # cost factor — higher = riskier
        "okr_alignment": 1.0-1.5   # multiplier — how directly this serves current-quarter OKRs
                                    # (optional, defaults to 1.0 = neutral)
    }

Method:
    benefit_score   = mean(revenue_impact, strategic_fit, runway_effect, time_to_impact)
    cost_risk_score = mean(resourcing_cost, risk)
    raw_priority     = benefit_score - cost_risk_score
    final_score      = raw_priority * okr_alignment

Ties (final scores within 0.01 of each other) are flagged for escalation rather than
silently broken — per venture-priority-matrix's escalation-on-tie principle.

Weights default to 1.0 for every factor (unweighted mean within each group). Override any
subset via --weights, e.g. {"strategic_fit": 1.5} to emphasize strategic fit.
"""
import json
import argparse

DEFAULT_WEIGHTS = {
    "revenue_impact": 1.0,
    "strategic_fit": 1.0,
    "runway_effect": 1.0,
    "time_to_impact": 1.0,
    "resourcing_cost": 1.0,
    "risk": 1.0,
}

BENEFIT_FACTORS = ["revenue_impact", "strategic_fit", "runway_effect", "time_to_impact"]
COST_FACTORS = ["resourcing_cost", "risk"]
TIE_THRESHOLD = 0.01


def validate_initiative(item):
    required = BENEFIT_FACTORS + COST_FACTORS + ["name"]
    missing = [f for f in required if f not in item]
    if missing:
        raise ValueError(f"Initiative '{item.get('name', '?')}' missing fields: {missing}")
    for f in BENEFIT_FACTORS + COST_FACTORS:
        if not (1 <= item[f] <= 5):
            raise ValueError(f"Initiative '{item['name']}' field '{f}' must be 1-5, got {item[f]}")
    okr = item.get("okr_alignment", 1.0)
    if not (1.0 <= okr <= 1.5):
        raise ValueError(f"Initiative '{item['name']}' okr_alignment must be 1.0-1.5, got {okr}")


def score_initiative(item, weights):
    benefit = sum(item[f] * weights.get(f, 1.0) for f in BENEFIT_FACTORS) / len(BENEFIT_FACTORS)
    cost = sum(item[f] * weights.get(f, 1.0) for f in COST_FACTORS) / len(COST_FACTORS)
    raw_priority = benefit - cost
    okr_alignment = item.get("okr_alignment", 1.0)
    final_score = raw_priority * okr_alignment
    return {
        "name": item["name"],
        "benefit_score": round(benefit, 2),
        "cost_risk_score": round(cost, 2),
        "raw_priority": round(raw_priority, 2),
        "okr_alignment": okr_alignment,
        "final_score": round(final_score, 2),
    }


def rank_initiatives(initiatives, weights=None):
    weights = weights or DEFAULT_WEIGHTS
    for item in initiatives:
        validate_initiative(item)
    scored = [score_initiative(item, weights) for item in initiatives]
    scored.sort(key=lambda x: x["final_score"], reverse=True)
    for i in range(len(scored) - 1):
        if abs(scored[i]["final_score"] - scored[i + 1]["final_score"]) < TIE_THRESHOLD:
            scored[i]["tie_flag"] = True
            scored[i + 1]["tie_flag"] = True
    return scored


def print_table(scored):
    header = f"{'Rank':<5}{'Initiative':<30}{'Benefit':<9}{'Cost/Risk':<11}{'Raw':<7}{'OKR x':<7}{'Final':<8}{'Flag'}"
    print(header)
    print("-" * len(header))
    for i, item in enumerate(scored, 1):
        tie = "TIE - escalate" if item.get("tie_flag") else ""
        print(
            f"{i:<5}{item['name']:<30}{item['benefit_score']:<9}{item['cost_risk_score']:<11}"
            f"{item['raw_priority']:<7}{item['okr_alignment']:<7}{item['final_score']:<8}{tie}"
        )


def main():
    parser = argparse.ArgumentParser(
        description="Score and rank competing initiatives for resource-allocation decisions."
    )
    parser.add_argument("input", help="Path to JSON file listing initiatives")
    parser.add_argument("--weights", help="Optional path to JSON file overriding default factor weights")
    parser.add_argument("--out", help="Optional path to save ranked output as JSON")
    args = parser.parse_args()

    with open(args.input) as f:
        initiatives = json.load(f)

    weights = dict(DEFAULT_WEIGHTS)
    if args.weights:
        with open(args.weights) as f:
            weights.update(json.load(f))

    scored = rank_initiatives(initiatives, weights)
    print_table(scored)

    if args.out:
        with open(args.out, "w") as f:
            json.dump(scored, f, indent=2)
        print(f"\nSaved ranked output to {args.out}")


if __name__ == "__main__":
    main()
