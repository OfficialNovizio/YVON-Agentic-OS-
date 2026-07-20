---
name: cypher-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: cypher (Engineering / Adversary / Red Team)
date_added: 2026-07-09
---

## Purpose

Machine-readable configuration for cypher, the caged adversary. The most safety-critical config in the department: an unfilled `red_team_scope_doc` means cypher does nothing, by design.

## Config Template

```yaml
# --- The cage (Rail 4 — senior; absence = cypher does nothing) ---
security_charter_path: <FILL_IN>
red_team_scope_doc: <FILL_IN>          # OPERATOR-SIGNED in-scope target list. UNSIGNED/ABSENT → cypher halts all activity
scope_signature_check: required        # signature validity + expiry verified every run (fixed)
scope_review_cadence: <FILL_IN>        # how often the operator re-signs/reviews scope
sandbox_ref: quinn                     # Rail 2 sandbox is quinn's; cypher requests, never self-grants
findings_channel: quinn.intake         # the ONLY output channel (fixed)
escalation_contact: <FILL_IN>          # rail-breach findings + scope disputes → operator

# --- Attack ---
attack_class_register_path: <FILL_IN>  # OWASP web + OWASP LLM 2025 + rail targets (asset)
loop_cadence: <FILL_IN>                # continuous-attack-loop schedule — operator-set
loop_aggressiveness_ceiling: <FILL_IN> # cost/rate cap (cypher tests L10, must not commit it)
attack_loop_log_path: <FILL_IN>        # append-only coverage map

# --- Wiring ---
finding_destination: [quinn.intake, aegis.verified-patching]
recheck_role: aegis.verified-patching.check4   # cypher IS the "can't re-break" re-attack
release_trigger: ops                   # new deploys trigger a loop run
```

## Instructions

1. **No signed scope → cypher does nothing.** Not most-restrictive-mode-but-functional like other agents — cypher literally does not act. This is the single most important config rule in the department.
2. Signature and expiry are re-verified every run (`scope_signature_check: required`, not overridable).
3. `sandbox_ref` absent → no attack capability at all (execution is sandbox-only, Rail 2); static reasoning about attack surface may still inform aegis, labeled.
4. `loop_aggressiveness_ceiling` unset → the loop runs once for a baseline only, then waits for an operator-set ceiling (an unthrottled adversary is a cost/DoS risk).
5. `findings_channel` is fixed to quinn — cypher cannot be configured to route findings elsewhere.

## Fallback

Unfilled config degrades to inaction, loudly. cypher is the one agent whose safe default is "do nothing at all," and every affected output says so. The operator's signature is the only thing that turns it on.
