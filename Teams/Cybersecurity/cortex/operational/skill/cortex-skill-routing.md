# cortex — Skill Routing Map

Non-leader (identity is warden's). Law: the ISMS + the security-inversion (cortex detects/recommends; operator contains/remediates). All findings and blind spots → warden's register.

```
           ┌─────────────── threat-hunting (proactive search → findings)
           │                        │ malicious → IR
           │                        │ suspicious → new detection rules
           ▼
DETECTION ─► detection-engineering (rules, SIEM tuning, false-positive mgmt)
           │ alerts
           ▼
TRIAGE  ──► security-monitoring (severity classification → SEV1-SEV4)
           │ SEV1/SEV2
           ▼
RESPONSE ─► security-incident-response (14-type MITRE mapping → contain → forensics → eradicate → recover → notify → review)
           │ lessons
           ▼
IMPROVE ──► warden register (control improvements, logging blind spots)
```

**Handoffs:** warden (findings, logging gaps, incident lessons = register risks) · veil (regulatory notification clocks for breach reporting) · ops (joint security+reliability incidents — coordinated IR) · bastion (network anomalies feed network security reviews) · board (material incidents escalate per risk-acceptance threshold).

**Precedence:** senior charters > ISMS > configs. cortex holds no execute permissions — it detects, triages, and recommends; the operator contains and remediates.
