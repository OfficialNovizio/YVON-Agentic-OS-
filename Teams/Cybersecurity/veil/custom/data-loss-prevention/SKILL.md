---
name: data-loss-prevention
type: custom (merge — data-security-analysis marketplace + custom DLP policy overlay)
status: built 2026-07-12
based_on_catalog_entry: none — new; sensitive-data egress monitoring (CYBERSECURITY-REDESIGN-PLAN-v2 §5.3)
sources_merged:
  - data-security-analysis (skillsmp.com/creators/scstelz/security-investigator/github-skills-data-security-analysis) — Microsoft Purview DLP event analysis, SIT access audits, EDM monitoring, DLP policy match correlation, insider risk triage, sensitivity label audits, Advanced Hunting query patterns.
  - Guardrails skill (skillsmp.com/ko/skills/aadityaparab-sentinel-stack-skills-guardrails-skill-md) — hard-block/soft-flag DLP signals, compliance signal emission (SOC2, ISO 27001, NIST CSF, GDPR).
note: Marketplace sources are integrated into this custom merge per playbook §4.6 and §4.8. The data-security-analysis skill provides DLP detection methodology and query patterns. The custom overlay provides the tool-agnostic DLP policy framework (what to protect, how to classify egress, who to alert) that works regardless of specific DLP vendor.
assigned_agent: veil (Cybersecurity / Data Privacy & Protection)
portable: true
date_added: 2026-07-12
---

# Data Loss Prevention (DLP)

## Introduction
The monitoring and enforcement of data egress controls — detecting and preventing unauthorized transfer of sensitive data outside the business's controlled environment. Combines **data-security-analysis** (Purview DLP event analysis, SIT/EDM monitoring, insider risk triage methodology) with a tool-agnostic custom DLP policy framework that defines what to protect, how to classify egress, and who to alert — independent of any specific DLP vendor.

**Detection methodology from:** data-security-analysis (Microsoft Purview patterns, Advanced Hunting queries). **Policy framework:** custom (tool-agnostic). **Guardrail integration:** Sentinel Stack.

## Purpose
Data leaves the business every day — through email, cloud uploads, USB devices, API calls, and shadow IT. Most of it is legitimate; some of it is a breach in progress. DLP distinguishes between the two by defining what sensitive data looks like (per classification tiers), where it's allowed to go, and what constitutes a violation — then detecting violations and enabling response.

## When to Use
- Monitoring for unauthorized egress of sensitive data.
- "Are we leaking data," "DLP alert review," "insider risk investigation."
- Configuring or tuning DLP policies.
- After a breach involving data exfiltration — reviewing DLP coverage.

## DLP Policy Framework (Custom)

### What to Protect — by Classification Tier
- **RESTRICTED**: Trade secrets, encryption keys, board communications, health records, payment card data. Monitor ALL egress channels. Hard-block where possible.
- **CONFIDENTIAL**: Customer PII, financial records, business plans, employee HR data, intellectual property. Monitor all egress channels. Alert on unusual volumes or destinations.
- **INTERNAL**: Internal policies, operational data. Monitor for bulk or anomalous egress.
- **PUBLIC**: No DLP restrictions.

### Egress Channels to Monitor
1. **Email** — sensitive data sent to personal addresses, unusual recipients, large attachments
2. **Cloud upload** — sensitive data uploaded to personal cloud storage, unapproved SaaS
3. **Web/API** — sensitive data in API calls, web form submissions, paste sites
4. **USB / removable media** — file copies to external drives
5. **Print** — sensitive documents printed in bulk
6. **Clipboard / screenshot** — data copied to unauthorized destinations
7. **Shadow IT** — data sent to unapproved SaaS applications

### Alert Severity
| Severity | Criteria | Action |
|---|---|---|
| **Critical** | RESTRICTED data to unauthorized destination | Immediate alert → operator + cortex IR |
| **High** | CONFIDENTIAL data, bulk egress, known bad domain | Alert → operator + security-monitoring |
| **Medium** | CONFIDENTIAL data, single event, unusual | Alert → operator review |
| **Low** | INTERNAL data, policy violation, minimal volume | Logged → periodic review |

## DLP Detection Methodology (data-security-analysis)

### Phase 1 — Monitor
1. **SIT (Sensitive Information Type) access audits** — monitor who accesses what sensitive data types and from where.
2. **EDM (Exact Data Match) monitoring** — detect exact matches of known sensitive data (e.g., customer lists, credit card numbers).
3. **Sensitivity label access** — monitor access to labeled documents for anomalous patterns.

### Phase 2 — Detect
4. **DLP policy match correlation** — correlate DLP alerts across channels for a single user or data set.
5. **Insider risk triage** — investigate users with repeated DLP violations, unusual access patterns, or data volume anomalies.

### Phase 3 — Investigate
6. **User drill-down** — investigate a specific user's DLP activity across all channels.
7. **File inventory** — what files were involved, their classification, their sensitivity labels.
8. **Temporal patterns** — is the activity time-bound (suggesting automated exfiltration) or ongoing?

### Phase 4 — Respond
9. **Hard-block** — for RESTRICTED data to unauthorized destinations, block the action and alert.
10. **Soft-flag** — for CONFIDENTIAL data, alert the user and log; escalate if repeated.
11. **Escalate to cortex IR** — if exfiltration is confirmed or suspected, cortex IR leads the investigation.

## Output Format
```
## DLP Investigation: [case/alert ID]
Data involved: [classification tier · data type · SIT match · label]
Channel: [email / cloud / web / USB / print / clipboard]
User: [identity · risk score · pattern]
Severity: [critical/high/medium/low]
Action: [hard-block / soft-flag / alerted / escalated to IR]
Findings: [what data left, where it went, how much]
Remediation: [policy tuning / user training / access review]
```

## Principles
- **Protect data, not just perimeters.** DLP follows the data, not the network boundary.
- **Classification drives policy.** A RESTRICTED data leak is a crisis; an INTERNAL leak is a policy violation. Don't conflate them.
- **Hard-block for RESTRICTED, soft-flag for CONFIDENTIAL.** Blocking everything destroys usability; allowing everything destroys security.
- **Alert severity scales with data sensitivity, not volume.** One RESTRICTED record is more important than 1000 INTERNAL records.
- **veil detects and recommends; the operator blocks/remediates.** The security-inversion — veil identifies the violation and recommends action; the operator executes blocks or user restrictions.

## Fallback
- No DLP tool deployed → manual egress review, labeled "manual — no DLP." Flag as a risk to warden.
- No data-security-analysis skill installed → use the custom DLP policy framework alone, with manual alert review.
- No sensitivity labels applied → use classification tiers directly; label gaps are a finding.

## Boundaries with Other Skills
- **data-classification** (sibling): DLP policy is driven by classification tiers — without classification, DLP has no policy to enforce.
- **privacy-by-design** (sibling): data protection controls (encryption, access) complement DLP; DLP catches what those controls miss.
- **breach-notification** (sibling): a confirmed data exfiltration through DLP triggers breach-notification obligations.
- **cortex IR**: confirmed exfiltration escalates to IR for investigation and containment.
- **cortex monitoring**: DLP alerts feed the monitoring triage queue.
- **warden**: DLP coverage gaps and unmonitored channels are register risks.
