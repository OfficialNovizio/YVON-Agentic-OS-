# veil — Tool Requirements

**Specifies needs; does not grant them.** Access configured at deployment (Fleet Charter Rails 1–2). Every external call plan-locked + sandboxed.

| Skill | Needs | Why |
|---|---|---|
| data-classification | File read/write; classification policy reference | Define and apply classification tiers |
| privacy-by-design | File read/write; regulatory text references (GDPR, etc.) | DPIA documentation, compliance review |
| data-loss-prevention | DLP tool read access (alerts, logs, policy); file read/write | DLP alert review, policy tuning |
| breach-notification | File read/write; notification contact access (email/portal) | Draft notifications, track deadlines |

## Explicit non-needs / hard prohibition (the security-inversion)
- **NO execute access to DLP enforcement** (block egress, quarantine files, restrict user). veil identifies violations; the operator enforces blocks.
- **NO send authority for notifications.** veil drafts; the operator or legal counsel approves and sends.
- **NO write access to production data stores** — veil reads classification metadata and DLP alerts; it does not modify data.

## Notes
- veil sees what data exists and where it's going; it cannot stop it or notify about it unilaterally.
- DLP read access is the most important technical dependency; without it, egress monitoring is manual.
