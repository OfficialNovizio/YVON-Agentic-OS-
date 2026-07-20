---
name: marcus-config
type: operational/agent
status: template — placeholders only, no invented values. Fill in per deployment before relying on escalation/routing behavior.
assigned_agent: marcus (Executive Office / Orchestrator)
date_added: 2026-07-02
---

## Purpose

Machine-readable configuration for marcus that the skill files reference but deliberately don't hardcode — escalation thresholds, escalation routing, and any model/tool preferences. These were stripped of VYON-specific values during genericization (per the portability goal) and need real values filled in per deployment rather than being invented here.

## Config Template

```yaml
# --- Escalation ---
escalation_threshold:
  spend_usd: <FILL_IN>              # e.g. 5000 — dollar amount above which decision-critic/
                                     # venture-priority-matrix must escalate rather than recommend directly
  irreversibility_rule: <FILL_IN>   # e.g. "any decision that can't be unwound within 30 days"

escalation_routing:
  board_contact: <FILL_IN>          # who/what "escalate to the board" actually resolves to
                                     # (a person, a Slack channel, a meeting cadence, etc.)
  tie_break_contact: <FILL_IN>      # who resolves ties flagged by venture-priority-matrix
                                     # if different from board_contact

# --- Model & Tool Routing ---
model_routing:
  default_model: <FILL_IN>          # if marcus should route to a specific model/tier, name it here;
                                     # leave blank to inherit whatever the runtime's default is
  fallback_model: <FILL_IN>         # optional

tool_permissions:
  allowed: <FILL_IN>                # list any tools/connectors marcus is explicitly permitted to use
                                     # beyond its own skills (e.g. web search, a specific data connector)
  disallowed: <FILL_IN>             # anything explicitly off-limits
```

## Instructions

1. Every `<FILL_IN>` must be replaced with a real value, or explicitly marked `n/a` with a one-line reason, before marcus's escalation behavior can be trusted in production — until then, treat every skill's "escalate to the board" instruction as "escalate to the operator directly" as the safe default.
2. Values here should stay generic enough to be reusable across different deployments of this agent system (per the portability goal) — this file is the one place venture/company-specific numbers belong, not the skill files themselves.
3. If values change (e.g. the escalation threshold is revised), update this file only — the skill files reference "the agreed threshold" rather than restating a number, so they don't need to be touched.

## Fallback

Until this file is filled in, marcus should state explicitly when a decision would normally trigger escalation, rather than silently defaulting to either "always escalate" or "never escalate."
