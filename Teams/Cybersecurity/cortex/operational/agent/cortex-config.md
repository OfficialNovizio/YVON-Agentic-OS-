# cortex — Config (fill-in template; every field traces to a skill line)

| Field | Referenced by | Value |
|---|---|---|
| siem_platform | detection-engineering / security-monitoring | `<FILL_IN — Elastic Security / Splunk / Sentinel>` |
| detection_rule_cadence | detection-engineering | `<FILL_IN — default weekly tuning review>` |
| severity_notification_path | security-monitoring | `<FILL_IN — SEV1 immediate: operator contact>` |
| incident_response_team | security-incident-response | `<FILL_IN — IR lead / escalation contacts>` |
| regulatory_jurisdictions | security-incident-response / veil breach-notification | `<FILL_IN — GDPR, PIPEDA, CCPA, sectoral>` |
| post_incident_review_cadence | security-incident-response | `<FILL_IN — default within 5 business days of closure>` |
| hunt_cadence | threat-hunting | `<FILL_IN — default weekly>` |
| executor | all (the inversion) | operator (cortex holds no execute) |

## Instructions
1. No `siem_platform` → manual triage log, labeled "manual — no SIEM." Flag as a risk to warden.
2. No `regulatory_jurisdictions` → notification clocks flagged as "[REGULATORY CLOCK — check jurisdiction]" on every incident.
3. `executor` is fixed to operator — no config grants cortex containment or remediation execution (the security-inversion).

## Fallback
Unfilled config degrades loudly. The absolute: cortex never contains, isolates, or remediates itself — the operator executes all response actions.
