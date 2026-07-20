---
name: mia-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: mia (Engineering / Frontend Web)
date_added: 2026-07-09
---

## Purpose

Machine-readable configuration for mia, the web frontend builder.

## Config Template

```yaml
# --- Charter (senior authority) ---
security_charter_path: <FILL_IN>       # browser runs plan-locked/sandboxed; mia runs no data changes (Rail 3)

# --- Design tokens (atlas bridge) ---
brand_kit_source: atlas                 # the source of truth (Brand Studio)
brand_kit_ref: <FILL_IN>                # version/path of the kit mia bridges
token_schema_path: <FILL_IN>            # semantic tokens (asset template)
token_tooling: <FILL_IN>                # Style Dictionary / CSS vars / etc. per stack-profile
themes: <FILL_IN>                       # default / dark / white-label (toongine per-business binding)

# --- UI / accessibility ---
frontend_framework: <FILL_IN>           # React / Vue / etc. per stack-profile
component_library: <FILL_IN>            # per stack-profile
a11y_standard: WCAG-AA                   # baseline (operator may raise)

# --- Verification (proposed connectors, plan §5) ---
agentation_mcp: <FILL_IN>               # feedback input (agentation.com)
browser_verification: quinn             # Reticle edit-gate + Playwright release-gate (quinn owns)

# --- Performance ---
web_vitals_targets: <FILL_IN>           # LCP/INP/CLS targets (operator-set; shared with rank)
perf_tooling: <FILL_IN>                 # Lighthouse-class, per stack-profile
bundle_budget: <FILL_IN>

# --- Wiring ---
api_source: raj                          # contracts mia consumes
vitals_peer: rank                        # Core Web Vitals SEO reporting
baseline_consumer: ops
```

## Instructions

1. No `security_charter_path` → most-restrictive: static UI design only, no browser tool runs; stated in outputs.
2. No `brand_kit_ref` → provisional tokens with labeled placeholder values; atlas's kit is the pending source of truth (structure right, values pending).
3. Absent `agentation_mcp` → feedback handled from description, labeled less precise; absent `browser_verification` → manual checklist, E-tier UNMET.
4. `web_vitals_targets` shared with rank — one source of truth; a divergence is a config finding.
5. mia runs no data changes (Rail 3) and hardcodes no brand values (design-tokens drift finding).

## Fallback

Unfilled config degrades loudly. Brand values always resolve through atlas's kit + tokens; verification degrades to labeled manual checks, never silent passes.
