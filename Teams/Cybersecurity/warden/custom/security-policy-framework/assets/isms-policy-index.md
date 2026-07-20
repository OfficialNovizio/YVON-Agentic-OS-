# ISMS Policy Index — [business name]

> The human-readable policy set implementing the control framework. Each policy: owner + review date (dated). Standard: [config `control_standard`]. Control text from the GRC pack; mapping is warden's.

## Control map (per control)
| Control ID (standard) | Description | Owner | Status | Evidence | Risk-register ref (if gap) |
|---|---|---|---|---|---|
| <FILL_IN> | | [agent/operator/dept] | impl / partial / gap / N-A (reason) | | |

## Policy set
| Policy | Implements controls | Owner | Review date | Notes |
|---|---|---|---|---|
| Access Control Policy | [IDs] | keyring | <FILL_IN> | least privilege; JML |
| Data Protection & Classification | [IDs] | veil | <FILL_IN> | PII tiers, retention |
| Encryption Policy | [IDs] | bastion/keyring | <FILL_IN> | at-rest/in-transit, key mgmt |
| Incident Response Policy | [IDs] | cortex | <FILL_IN> | severities, comms, clocks |
| Configuration / Hardening | [IDs] | bastion | <FILL_IN> | CIS baselines |
| Acceptable Use | [IDs] | warden | <FILL_IN> | people-facing |
| Third-Party / Vendor Security | [IDs] | warden | <FILL_IN> | assessment gate |
| Exception Policy | [IDs] | warden | <FILL_IN> | time-boxed, board on high-risk |

## Rules
- No control without an owner; no gap without a risk-register entry.
- Non-applicable controls carry a written reason.
- Material policy changes → anneal → board (Fleet Charter Rail 3). Senior: Engineering Security Charter ≥ Fleet Charter.
