---
name: breach-notification
type: custom
status: built 2026-07-12
based_on_catalog_entry: none — new; regulatory notification clocks per jurisdiction (CYBERSECURITY-REDESIGN-PLAN-v2 §5.4)
marketplace_search: 2026-07-12 — no standalone regulatory notification clock agent skill found on skillsmp, mcpmarket, or awesomeskill. Breach notification is jurisdiction-specific and depends on the business's legal obligations; no portable equivalent exists.
assigned_agent: veil (Cybersecurity / Data Privacy & Protection)
portable: true — the notification method is portable; the jurisdictions, clocks, and contacts are per-business config
includes: scripts/deadline_calc.py (tested — self-tests built in)
date_added: 2026-07-12
---

# Breach Notification

## Introduction
The disciplined management of regulatory notification obligations when a data breach occurs. Different jurisdictions have different clocks, thresholds, and requirements — GDPR's 72 hours, PIPEDA's as-soon-as-possible, CCPA's no-unreasonable-delay. This skill tracks which jurisdictions apply, what the notification triggers are, who needs to be notified, and ensures no regulatory deadline is missed.

## Purpose
Missing a regulatory notification deadline is often more costly than the breach itself — fines for late notification can exceed fines for the underlying incident. This skill exists to make sure that when a breach happens, the notification clock is tracked, the right contacts are notified, and every regulatory obligation is met with time to spare.

## When to Use
- A data breach is confirmed (by cortex IR).
- "Do we need to notify anyone," "what's our GDPR clock," "breach notification obligations."
- Testing / tabletop exercise for breach notification.
- Updating notification contacts or jurisdictional scope.

## Jurisdictional Notification Requirements (config-driven)

**Note:** The actual jurisdictions, thresholds, and contacts are per-business config (`operational/agent/veil-config.md`). The following are common frameworks. The operator must confirm which apply.

### Common Frameworks (reference, not exhaustive)

| Jurisdiction | Regulation | Clock | Trigger | Notification To |
|---|---|---|---|---|
| EU / EEA | GDPR | 72 hours | Personal data breach | Supervisory authority + data subjects (if high risk) |
| Canada | PIPEDA | As soon as feasible | Breach of security safeguards | Privacy Commissioner + affected individuals |
| California | CCPA | No unreasonable delay | Unauthorized access to personal info | Affected residents |
| UK | UK GDPR | 72 hours | Personal data breach | ICO + data subjects (if high risk) |
| Australia | Notifiable Data Breaches | As soon as practicable | Eligible data breach | OAIC + affected individuals |
| PCI DSS | Cardholder data | 24 hours | Cardholder data compromise | Acquirer / card brands |
| Sectoral (health) | HIPAA / PHIPA | 60 days (HIPAA) / as soon as possible | PHI breach | HHS + affected individuals |

## Structure / Protocol

```
BREACH CONFIRMED (by cortex IR — data type, scope, affected individuals confirmed)
  → IDENTIFY APPLICABLE JURISDICTIONS (config: which regulations apply to this business)
    → CHECK NOTIFICATION TRIGGERS (does this breach meet the threshold for each jurisdiction?)
      → TRACK CLOCKS (per jurisdiction: breach confirmation timestamp → deadline)
        → PREPARE NOTIFICATION (facts required per jurisdiction: what happened, what data, what response)
          → APPROVE (operator/legal review before sending)
            → SEND NOTIFICATION (operator executes; veil provides the draft)
              → LOG (notification details, timestamp sent, recipient confirmation)
```

## Instructions

### Phase 1 — Identify Jurisdictions
1. **Load the configured jurisdictions** from veil's config (`regulatory_jurisdictions`). If unset, flag: "[CONFIG NEEDED] — no jurisdictions configured; assume GDPR applies and flag uncertainty."
2. **For each jurisdiction:** determine if the breach triggers notification based on the data type involved and the jurisdiction's threshold.

### Phase 2 — Check Triggers
3. **Determine per jurisdiction whether notification is required:**
   - **GDPR**: personal data breach → likely notification. High risk to data subjects → notify individuals. Risk assessment is fact-specific.
   - **PIPEDA**: breach of security safeguards involving personal information that creates a real risk of significant harm → notify.
   - **CCPA**: unauthorized access to personal information → notify without unreasonable delay.
   - **PCI DSS**: cardholder data compromised → notify acquirer within 24 hours.

### Phase 3 — Track Clocks
4. **For each jurisdiction, calculate the deadline:**
   - **GDPR**: breach confirmation time + 72 hours = deadline
   - **PIPEDA**: "as soon as feasible" — document the notification sent timestamp
   - **PCI DSS**: breach confirmation + 24 hours = deadline
5. **Set internal alerts** at 50% and 75% of the deadline window — never let the clock run out.

### Phase 4 — Prepare Notification
6. **Draft notification per jurisdiction requirements.** Common elements:
   - Description of the breach (what happened, when, how discovered)
   - Nature and categories of data involved
   - Measures taken or proposed to address the breach
   - Measures to mitigate potential adverse effects
   - Contact information for the data protection officer or responsible contact

### Phase 5 — Approve and Send
7. **Draft → operator/legal review** — notification is not sent without approval.
8. **Operator sends notification** — veil prepares the draft and tracks the deadline; the operator or legal counsel executes the sending.
9. **Log everything.** Timestamp when notification was sent, recipient confirmation, any feedback received.

### Phase 6 — Post-Notification
10. **Update cortex IR record** with notification status.
11. **If multiple jurisdictions:** track separately; requirements differ and compliance is per-jurisdiction.
12. **Lessons → warden.** Delays in notification (missed internal alerts, unclear jurisdiction) are process improvements.

## Output Format
```
## Breach Notification: [incident reference]
Breach confirmed: [timestamp]
Jurisdictions:
  [Regulation]: [trigger met? · clock: X hours · deadline: datetime · status: pending/sent/waived]
  [Regulation]: [trigger met? · clock: X hours · deadline: datetime · status: pending/sent/waived]
Notification draft: [prepared / pending operator approval]
Sent: [timestamp(s) · to whom · confirmation received?]
Post-notification: [cortex IR updated · lessons → warden]
```

## Principles
- **Clocks start at confirmation.** The moment cortex confirms a breach, the notification timer starts. No delay for investigation.
- **When in doubt, notify.** GDPR's principle: if there's a reasonable likelihood of risk to individuals, notify. Non-notification is a harder decision than notification.
- **Track per jurisdiction separately.** Multi-jurisdiction breaches have multiple deadlines, multiple formats, and multiple regulators.
- **Draft is veil's job; sending is the operator's.** veil prepares the notification; the operator or legal counsel approves and sends.
- **Log everything.** Notification timestamps, content, recipient confirmations — if it's not documented, it didn't happen.

## Fallback
- No jurisdictions configured → assume GDPR applies (72-hour clock). Flag the need for config immediately.
- Unclear whether notification is required → default to notifying. The cost of an unnecessary notification is far lower than a missed regulatory deadline.
- Operator unavailable for approval → escalate through the configured escalation path; if none exists, notify and document the decision.

## Boundaries with Other Skills
- **cortex IR** (Cybersecurity): confirms the breach and provides the facts (data type, scope, affected individuals) that drive notification.
- **DLP** (sibling): a DLP-confirmed exfiltration may trigger breach notification.
- **data-classification** (sibling): classification determines severity of breach and which jurisdictions' triggers fire.
- **privacy-by-design** (sibling): data protection controls reduce breach likelihood; when a breach happens, this skill manages the fallout.
- **warden**: missed deadlines and notification gaps are register risks.
- **future Legal department**: notification drafting and regulatory coordination.
- **board (Governance)**: material breach notifications may need board awareness per risk-acceptance threshold.
