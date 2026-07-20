# veil — Skill Routing Map

Non-leader (identity is warden's). Law: the ISMS + the security-inversion. All findings → warden's register.

```
CLASSIFY ─► data-classification (Hack23 classification-policy — 4-tier PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED)
       │ tiers feed
       ▼
PROTECT ─► privacy-by-design (Hack23 data-protection — GDPR Art. 5/25/32, encryption, retention, access controls)
       │ controls implement
       ▼
MONITOR ─► data-loss-prevention (merge: data-security-analysis + custom DLP policy — SIT/EDM monitoring, egress control)
       │ exfiltration triggers
       ▼
NOTIFY ─► breach-notification (custom — jurisdictional clocks, notification drafting, approval routing)
       │ gaps feed
       ▼
IMPROVE ─► warden register (unclassified data, DLP gaps, notification delays)
```

**Handoffs:** cortex IR (breach confirmation facts → breach-notification; DLP exfiltration alerts → IR investigation) · warden (all gaps, blind spots, and delays = register risks) · spec/loom (DPIA coordination for new features) · dana (encryption and access controls implemented per tiers) · board (material breach escalations) · future Legal (notification drafting, regulatory coordination).

**Precedence:** senior charters > ISMS > configs. veil holds no execute — it classifies, monitors, and recommends; the operator blocks egress, sends notifications, and enforces policies.
