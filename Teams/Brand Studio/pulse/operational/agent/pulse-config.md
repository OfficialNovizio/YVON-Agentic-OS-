---
name: pulse-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: pulse (Brand Studio / Social Media)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for pulse; toongine binds per business. This is the multi-platform binding point discussed 2026-07-07.

## Config Template

```yaml
# --- Platforms (one entry per connected platform, per brand) ---
brands:
  - brand_id: <FILL_IN>
    platforms:
      - platform: <FILL_IN>              # e.g., instagram / tiktok / youtube / linkedin / x
        connector: <FILL_IN>             # MCP/API binding; unset = ready-to-post packages +
                                          # operator-supplied sweep exports
        access: <FILL_IN>                # read-metrics / publish / engage (any subset)
        playbook_path: <FILL_IN>         # this platform's dated playbook (from the template)
    hooks_register_path: <FILL_IN>       # the learning loop (append-only)
    voice_guide_path: <SEE lena-config>  # pointer — lena's field, never forked

# --- Cadences ---
planning_cadence: <FILL_IN>              # calendar planning rhythm (e.g., weekly)
engagement_cadence: <FILL_IN>            # sweep rhythm per platform (can vary)
playbook_review_cadence: <FILL_IN>       # the volatile layer's refresh rhythm (e.g., monthly)

# --- Engagement rules ---
reply_mode: <FILL_IN>                    # auto / queue-for-approval (GREEN class only)
escalation_contact: <FILL_IN>            # who receives AMBER drafts + RED escalations
                                          # (operator until set)
reply_scope_notes: <FILL_IN>             # business-specific additions to the GREEN scope
                                          # (never subtractions from AMBER/RED)
```

## Instructions

1. Unconnected platforms are never planned for by assumption; per-run operator naming flags the config gap.
2. `access` governs capability honestly: no publish access → packages; no engage access → sweep from exports.
3. `reply_mode: auto` still respects AMBER/RED absolutely — the mode only governs GREEN.
4. `reply_scope_notes` may extend GREEN; AMBER/RED classes are floor rules and cannot be configured away.
5. Add fields only when a skill references them.

## Fallback

Unfilled config degrades loudly, never silently.
