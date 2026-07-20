---
name: atlas-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: atlas (Brand Studio / Art Director)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for atlas. All values are per-business; toongine binds them per deployment.

## Config Template

```yaml
# --- Brand kits (brand-guidelines Phase 1; one entry per brand) ---
brands:
  - brand_id: <FILL_IN>
    brand_kit_path: <FILL_IN>        # the filled-in brand-kit file (from assets/brand-kit-template.md
                                      # or brand-identity's output)
  # - brand_id: …                    # repeat per brand; single-brand businesses have one entry

# --- Multi-brand separation (multi-brand-system Phase 1) ---
brand_separation_matrix: <FILL_IN>   # path to the operator-approved matrix; leave unset for
                                      # single-brand businesses (skill is a documented no-op)

# --- Audit logging (brand-guidelines Phase 5) ---
audit_log_destination: <FILL_IN>     # where PASS/fix-list results and drift notes are recorded;
                                      # drift notes also route to spark
accessibility_bar: <FILL_IN>         # WCAG level the kits enforce (AA typical; the kit template's
                                      # §2 line should match this)
```

## Instructions

1. No `brand_kit_path` → brand-guidelines stops and offers the template or brand-identity; nothing is audited from memory.
2. `brand_separation_matrix` unset with 2+ brands listed → multi-brand-system stops and asks; unset with 1 brand → documented no-op.
3. `audit_log_destination` unset → results go to the operator directly, stated in each output.
4. `accessibility_bar` unset → the kit's own §2 line governs; if both are unset, contrast findings are reported as informational until the operator sets the bar.

## Fallback

Unfilled config degrades loudly (stop-and-ask or deliver-to-operator), never silently.
