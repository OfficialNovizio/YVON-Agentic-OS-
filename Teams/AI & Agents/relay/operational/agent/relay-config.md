# relay — Config (fill-in template; every field traces to a skill line)

| Field | Referenced by | Value |
|---|---|---|
| audit_cadence | least-privilege-grants §4; mcp-tool-registry §6 | `<FILL_IN: suggested quarterly>` |
| trial_period | mcp-tool-registry §3 | `<FILL_IN: suggested 30 days>` |
| retry_budget / backoff | integration-patterns §2 | `<FILL_IN: suggested 3 attempts, exp backoff + jitter>` |
| circuit_breaker_threshold | integration-patterns §3 | `<FILL_IN: suggested 5 consecutive failures>` |
| quinn_handoff_channel (allowlist exports) | egress-allowlist-authoring §4 | `<FILL_IN>` |
| operator_contact (broad grants, wildcards) | least-privilege-grants §2; egress §2 | `<FILL_IN>` |

Suggested values are reasoning-based defaults (rule 0.6), not formula-verified.
