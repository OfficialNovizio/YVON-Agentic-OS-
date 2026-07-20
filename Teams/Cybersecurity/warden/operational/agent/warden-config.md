# warden — Config (fill-in template; every field traces to a skill line)

| Field | Referenced by | Value |
|---|---|---|
| control_standard | security-policy-framework | `<FILL_IN: NIST CSF / ISO 27001 / SOC 2 / CIS — installs the GRC pack>` |
| grc_pack_installed | security-policy-framework | `<FILL_IN — Sushegaad GRC pack for the chosen standard; runtime-install>` |
| security_profile (crown-jewel assets, obligations, cloud accounts) | risk-register / all | `<FILL_IN per business>` |
| likelihood_scale / impact_scale | risk-register / risk_score.py | `<FILL_IN — default 5×5; reasoning-based (0.6)>` |
| risk_acceptance_threshold | risk-register / security-exception-process | `<FILL_IN — above → board; e.g. score ≥ 15>` |
| risk_register_path / exception_register_path | risk-register / exceptions | `<FILL_IN — append-only>` |
| vendor_review_cadence | third-party-risk | `<FILL_IN>` |
| board_route | risk-register / exceptions / policy changes | board (Governance) — risk acceptance + Rail 3 changes |
| privileged_executor | all (the inversion) | operator (warden holds no keys) |

## Instructions
1. No `control_standard` → default to CIS Controls IG1 baseline, provisional; surface the GRC pack for adoption.
2. No scoring scales → default 5×5, loudly flagged reasoning-based; propose to operator.
3. `privileged_executor` is fixed to the operator — no config grants warden key-holding or execution (the security-inversion).
4. Risk acceptance above `risk_acceptance_threshold` and material policy changes route to board; unfilled board route (Governance dormant) → decisions QUEUE, not proceed (most-restrictive).

## Fallback
Unfilled config degrades loudly. The absolute: warden never holds keys or accepts material risk itself — those are the operator's/board's, by design.
