# warden — Tool Requirements

**Specifies needs; does not grant them.** Access configured at deployment (Fleet Charter Rails 1–2 — registered tools, least privilege). Every external call plan-locked (Eng Rail 1) + sandboxed (Rail 2).

| Skill | Needs | Why |
|---|---|---|
| security-policy-framework | GRC pack (runtime-install, Sushegaad, MIT); file read/write (own ISMS/policy index) | control catalog + mapping |
| risk-register | script execution (risk_score.py — stdlib); file read/write (own append-only register) | scored, tracked risks |
| third-party-risk | file read/write (own vendor register); read of vendor certs/questionnaires | vendor assessment |
| security-exception-process | file read/write (own append-only exception register) | time-boxed waivers |

## Explicit non-needs / hard prohibition (the security-inversion)
- **NO keys, credentials, or privileged access.** warden never provisions, contains, or remediates — the operator executes every privileged change.
- **No write access to production systems, cloud accounts, or identity stores** — warden writes policy and risk records only.
- **No risk acceptance authority for material risk** — that's the operator's/board's.

## Notes
- warden is the department's most-watched, least-privileged agent by design; its power is analysis and policy, not action.
- The GRC pack is a runtime-installed connector (rank/claude-seo pattern), surfaced to the operator per the chosen standard.
