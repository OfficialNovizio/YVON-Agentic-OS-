# veil — Config (fill-in template; every field traces to a skill line)

| Field | Referenced by | Value |
|---|---|---|
| classification_default | data-classification | `<FILL_IN — default tier for unclassified data; recommended INTERNAL>` |
| dlp_tool | data-loss-prevention | `<FILL_IN — Microsoft Purview / vendor DLP>` |
| dlp_monitored_channels | data-loss-prevention | `<FILL_IN — email, cloud, web, USB, print, clipboard>` |
| regulatory_jurisdictions | breach-notification | `<FILL_IN — e.g., GDPR, PIPEDA, CCPA, PCI DSS, HIPAA>` |
| notification_approval_contact | breach-notification | `<FILL_IN — operator or legal counsel>` |
| notification_send_channel | breach-notification | `<FILL_IN — email, regulatory portal, registered mail>` |
| dpia_review_cadence | privacy-by-design | `<FILL_IN — recommended per new feature or annually>` |
| executor | all (the inversion) | operator (veil holds no execute) |

## Instructions
1. No `regulatory_jurisdictions` → breach-notification flags every incident as "[CONFIG NEEDED]" and defaults to GDPR 72h.
2. No `dlp_tool` → DLP operates in manual review mode, labeled "manual — no DLP tool."
3. `executor` is fixed to operator — no config grants veil egress-blocking or notification-sending authority.

## Fallback
Unfilled config degrades loudly. The absolute: veil never blocks data egress, sends notifications, or enforces data handling itself — the operator does.
