---
name: nova-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: nova (Engineering / Mobile)
date_added: 2026-07-09
---

## Purpose

Machine-readable configuration for nova, the mobile builder. The defining field is `mobile_active` — false by default, and false means nova is entirely dormant.

## Config Template

```yaml
# --- The dormant switch (checked before everything) ---
mobile_active: false                    # DEFAULT false. true only when the business has a mobile app.
                                        # false → nova dormant; all mobile triggers route to mia (web)

# --- Charter (senior authority) ---
security_charter_path: <FILL_IN>        # nova runs no data changes (Rail 3); operator holds signing secrets
signing_secrets_holder: operator        # app signing keys/certs — NEVER the agent

# --- Framework & architecture (only when mobile_active) ---
mobile_framework: <FILL_IN>             # Flutter / React Native / native — per stack-profile
flutter_playbook_path: <FILL_IN>        # dated playbook (asset) if Flutter
state_approach: <FILL_IN>               # per playbook
local_store: <FILL_IN>                  # on-device persistence; secure storage for sensitive

# --- Verification ---
device_matrix: <FILL_IN>                # real devices/OS versions to test (not simulator-only)
device_farm: <FILL_IN>                  # tooling, per stack-profile
critical_flows: <FILL_IN>               # on-device release-gate flows (shared discipline with quinn)

# --- Release ---
stores: <FILL_IN>                       # iOS App Store / Google Play
staged_rollout: [1, 10, 100]            # percent stages (mobile's rollback substitute)
kill_switch: raj.feature-flags          # server-side disable for a bad release (the real safety net)

# --- Wiring ---
web_counterpart: mia
api_source: raj
data_model: dana
```

## Instructions

1. **`mobile_active: false` (default) → nova is dormant.** No architecture, no builds, no releases; every mobile request routes to mia with a "web-only" note. Only the operator flips it true when a real app exists (tempo's pattern).
2. No `security_charter_path` → most-restrictive; and regardless, signing secrets are operator-held and nova runs no data changes (Rail 3).
3. `device_matrix` unset → verification uses the widest real devices available, labeled; never simulator-only as a verdict.
4. `staged_rollout` is the rollback substitute — mobile can't be recalled; a non-staged full release is refused.
5. `kill_switch` (raj feature flags) is the real mobile safety net; a risky release without one is a finding.

## Fallback

Default state is dormant. When active, unfilled config degrades loudly; signing stays operator-held and rollout stays staged — the two non-negotiables given mobile's weak rollback.
