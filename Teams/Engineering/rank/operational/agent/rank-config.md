---
name: rank-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: rank (Engineering / Technical SEO)
date_added: 2026-07-09
---

## Purpose

Machine-readable configuration for rank, the technical-SEO executor.

## Config Template

```yaml
# --- Charter (senior authority) ---
security_charter_path: <FILL_IN>       # plugin runs plan-locked/sandboxed; rank runs no data changes (Rail 3); no direct production edits

# --- The plugin ---
claude_seo_installed: <FILL_IN>        # AgriciDaniel/claude-seo (MIT) — runtime-installed connector (plan §5)
claude_seo_version_seen: "1.9.9"       # dated; the plugin updates — treat as a dated playbook
suppress_community_footer: true        # strip the tool's promo from operator-facing output
plugin_extensions: <FILL_IN>           # optional: Firecrawl, DataForSEO, image-gen (separate installers)

# --- Site ---
site_url: <FILL_IN>
sitemap_path: <FILL_IN>
robots_path: <FILL_IN>
google_api_creds: <FILL_IN>            # GSC/PageSpeed/CrUX/Indexing/GA4 (optional; plugin uses if present)

# --- Ownership boundary (the plan's mandated split) ---
strategy_measurement_owner: kai         # Brand Studio — SEO strategy + measurement (scorecard §6)
technical_execution_owner: rank         # this agent
shared_signals:
  core_web_vitals: [mia_builds, rank_frames, kai_measures]
  geo: [rank_markup, kai_lena_content]

# --- Implementation path (rank specs; builders implement) ---
frontend_impl: mia
server_impl: raj
review: dev
gate: quinn
```

## Instructions

1. No `security_charter_path` → most-restrictive: analysis-only, no plugin execution against live systems; stated in outputs.
2. `claude_seo_installed` false → rank works method-only (technical-seo-execution + structured-data-geo), labeled reduced-automation; surface the plugin as a connector to the operator (plan §5).
3. `suppress_community_footer: true` (fixed default) — the plugin's promo footer is stripped from operator-facing business output.
4. Ownership is fixed to the plan's split: strategy/measurement = kai, technical execution = rank; a task on the wrong side is handed over with a brief, never absorbed.
5. rank specs fixes; `frontend_impl`/`server_impl` implement through `review`/`gate` — rank never auto-edits production or via the plugin.

## Fallback

Unfilled config degrades loudly. Without the plugin, rank's own method carries technical SEO; the kai boundary and the no-direct-edit rule hold regardless.
