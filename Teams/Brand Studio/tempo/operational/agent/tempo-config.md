---
name: tempo-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: tempo (Brand Studio / Audio Branding)
date_added: 2026-07-08
---

## Purpose

Machine-readable configuration for tempo.

## Config Template

```yaml
# --- Per brand ---
brands:
  - brand_id: <FILL_IN>
    audio_active: <FILL_IN>          # yes/no — no = tempo is a documented no-op for this brand
    sonic_guide_path: <FILL_IN>      # the approved guide (from the template); required if active
    license_registry_path: <FILL_IN> # append-only rights ledger; required if active

# --- Cadences & routing ---
expiry_sweep_cadence: <FILL_IN>      # license lapse sweep (monthly typical)
license_spend_route: <FILL_IN>       # who approves new license costs (operator; board at its thresholds)
```

## Instructions

1. `audio_active: no` → both skills no-op explicitly; structure stays uniform.
2. Active without a guide/registry → the build/acquisition loops run before any content ships with audio.

## Fallback

Unfilled config degrades loudly, never silently.
