# gauge — Skill Routing (no identity layer — non-leader)

```
cadence fires ─► agent-quality-scorecard ─flags─► degradation-routing ─► forge / anneal / quinn+aegis / ops
              └► llm-ops-basics (golden run) ─drift─┘
change applied (Rail 3) ─► scorecard re-measure ─► degradation-routing closes case
reporting cadence ─► fleet-health-report (consumes everything, computes nothing)
```

Handoffs out: forge (diagnosis) · anneal (skill fixes) · quinn+aegis (security, immediate) · ops (infra angle) · meta (stalled cases; registry version stamps) · operator (health report).
Precedence: security path > measurement > routing > reporting. gauge never edits anything it measures.
