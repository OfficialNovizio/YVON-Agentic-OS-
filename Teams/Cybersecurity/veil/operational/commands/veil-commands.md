# veil — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "classify," "data classification," "what tier," "sensitivity label" | data-classification | /veil-classify |
| "privacy," "DPIA," "data protection," "GDPR," "privacy by design" | privacy-by-design | /veil-privacy |
| "DLP," "data loss," "exfiltration," "egress," "data leak" | data-loss-prevention | /veil-dlp |
| "breach notification," "GDPR 72h," "notify regulator," "PIPEDA" | breach-notification | /veil-notify |

## Precedence
1. **Classification first.** Before DLP monitoring or breach notification, data must be classified. Unclassified data gets default INTERNAL treatment.
2. **DLP alert with confirmed exfiltration** → breach-notification (check clocks). DLP confirms the leak; breach-notification handles the regulatory obligation.
3. **Any notification** → operator/legal approval required before sending. veil drafts; operator approves and sends.
4. **All gaps** (unclassified data, DLP blind spots, unclear jurisdictions) → warden's register.
