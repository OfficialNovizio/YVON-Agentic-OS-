# warden — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "security policy," "control framework," "map us to NIST/ISO/SOC 2," "ISMS," "control gap" | security-policy-framework | /warden-isms |
| "risk," "risk register," "score this risk," "accept the risk," "top risks," "prioritize security" | risk-register | /warden-risk |
| "vendor security," "third-party risk," "assess this SaaS," "DPA," "supply chain" | third-party-risk | /warden-vendor |
| "exception," "waiver," "we can't meet control X," "temporary exception" | security-exception-process | /warden-exception |

## Precedence
1. Every gap/finding/incident/vendor issue lands in the **risk-register** — it's the spine; other skills feed it.
2. Any **risk acceptance** above threshold → board (Governance); warden recommends, never self-accepts material risk.
3. Any **privileged execution** (provisioning, containment, remediation) → the operator; warden holds no keys (the security-inversion).
4. Material policy changes → anneal → board (Fleet Charter Rail 3); senior charters unchanged.
