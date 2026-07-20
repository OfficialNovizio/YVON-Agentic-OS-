---
name: spark-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line. Spark mostly consumes the definers' configs (atlas/lena/weave) rather than duplicating them.
assigned_agent: spark (Brand Studio / Creative Director — department leader)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for spark.

## Config Template

```yaml
# --- Consumed from the definers (single sources of truth — never duplicated here) ---
# brand kits + separation matrix → atlas-config · voice guides → lena-config ·
# arcs + chapter registries → weave-config

# --- Spark's own fields ---
gate_log_destination: <FILL_IN>        # where PASS/FIX LIST verdicts are recorded
                                        # (coherence-qa Phase 4)
override_log_destination: <FILL_IN>    # operator overrides of the gate, logged like board
                                        # overrules (precedent's discipline) — fallback section
non_chapter_content_review_cadence: <FILL_IN>  # how often the labeled non-chapter share is
                                        # reviewed with weave/operator (coherence-qa Phase 2.3)
amendment_route: <FILL_IN>             # who receives document-conflict amendment questions
                                        # (operator; coherence-qa Phase 4 escalations)
```

## Instructions

1. Definers' documents missing → the gate's power narrows to recommend-only for that lane, stated in every verdict; fix is the definer's creation loop, not a spark config entry.
2. Logs unset → verdicts/overrides go to the operator directly, stated in output.
3. Add fields only when a skill references them.

## Fallback

Unfilled config degrades loudly, never silently.
