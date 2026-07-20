---
name: lena-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: lena (Brand Studio / Brand Voice)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for lena; toongine binds per business.

## Config Template

```yaml
# --- Voice (voice-guides Phase 1; one entry per brand) ---
brands:
  - brand_id: <FILL_IN>
    voice_guide_path: <FILL_IN>     # the filled-in voice-guide file (from the template +
                                     # operator-corrected samples)

# --- Email (email-marketer) ---
email_connector: <FILL_IN>          # send transport (ESP connector) — unset = lena designs,
                                     # operator sends manually
consent_jurisdiction: <FILL_IN>     # operator-supplied consent regime the sequences must
                                     # respect (e.g., CASL for Canada — stricter than CAN-SPAM);
                                     # legal questions route to operator/counsel
# --- Testing handoff (copywriting → nate) ---
variant_count_default: <FILL_IN>    # copy variants produced per conversion piece; catalog
                                     # suggests 3 — confirm, don't assume

# --- Overrides ---
override_log_destination: <FILL_IN> # where voice-breaking override decisions are recorded
                                     # (voice-guides Phase 4); operator directly until set
```

## Instructions

1. No `voice_guide_path` for a brand → voice-guides' creation loop runs first; emergency drafts are labeled voice-neutral.
2. `email_connector` unset → sequences delivered as ready-to-load packages; stated in output.
3. `consent_jurisdiction` unset → email-marketer's push-back rules apply at their strictest reading, and lena says the jurisdiction input is missing.
4. Add fields only when a skill references them.

## Fallback

Unfilled config degrades loudly, never silently.
