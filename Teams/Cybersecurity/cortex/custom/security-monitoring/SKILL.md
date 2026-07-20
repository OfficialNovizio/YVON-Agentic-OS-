---
name: security-monitoring
type: custom (merge — Elastic Security MCP + Incident Commander)
status: built 2026-07-12
based_on_catalog_entry: none — new; SIEM monitoring, alert triage, severity classification (CYBERSECURITY-REDESIGN-PLAN-v2 §4.2)
sources_merged:
  - Elastic Security MCP (skillsmp.com/creators/elastic/example-mcp-app-security) — alert triage workflow, case management, detection rule tuning, false positive management.
  - Incident Commander (skillsmp.com/ar/creators/devcharuzu/philfida-taskmanage/windsurf-skills-incident-commander) — severity classification (SEV1-SEV4), timeline reconstruction, runbook integration, communication templates, post-incident reviews.
note: Marketplace sources are integrated into this custom merge per playbook §4.6 and §4.8. Elastic provides tool-level SIEM workflows; Incident Commander provides severity taxonomy and runbook framework.
assigned_agent: cortex (Cybersecurity / Security Operations)
portable: true
date_added: 2026-07-12
---

# Security Monitoring

## Introduction
The live watch over the business's security posture — ingesting alerts from detection rules, triaging them by severity, managing the response runbook, and ensuring nothing falls through the cracks. Combines **Elastic Security MCP** (tool-level SIEM workflows, alert triage, case management) with **Incident Commander** (severity classification, runbook integration, communication templates, post-incident reviews).

**Tool workflow from:** Elastic Security MCP. **Severity/runbook framework from:** Incident Commander. The integration is custom.

## Purpose
Security monitoring turns raw alerts into managed incidents. Without a structured triage process, alerts pile up, real incidents get buried in noise, and severity is inconsistent. This skill provides the discipline to triage consistently, classify accurately, and respond systematically.

## When to Use
- An alert fires in the SIEM.
- A detection rule needs triage queueing.
- An incident's severity needs classification.
- A runbook needs to be executed for a known scenario.
- Post-incident review needs to be conducted.

## Severity Classification (Incident Commander framework)

| Severity | Definition | Response Time | Escalation |
|---|---|---|---|
| **SEV1** | Critical impact — active breach, data exfiltration, production compromise | Immediate (≤15 min) | Full IR team + operator notified |
| **SEV2** | High impact — confirmed compromise of non-critical system, credential theft, malware detected | ≤1 hour | IR lead + system owner |
| **SEV3** | Moderate impact — suspicious activity, policy violation, potential indicator | ≤4 hours | Assigned analyst |
| **SEV4** | Low impact — minor anomaly, informational, false positive candidate | ≤24 hours | Triage queue |

## Structure / Protocol

```
ALERT INGEST (from detection-engineering rules, SIEM, or external feeds)
  → TRIAGE (Elastic workflow: fetch → investigate → classify)
    → CLASSIFY per Incident Commander severity: SEV1 / SEV2 / SEV3 / SEV4
      → ASSIGN runbook (if known scenario) or escalate
        → DOCUMENT in case management (Elastic cases)
          → RESPOND per runbook or escalation path
            → POST-INCIDENT (Incident Commander template: timeline, communication log, lessons)
```

## Instructions

### Phase 1 — Triage (Elastic workflow)
1. **Fetch and investigate.** Pull the alert from the SIEM. Check the event details, related entities (host, user, IP), and historical context.
2. **Classify.** True positive, false positive, or further investigation needed.
3. **For true positives:** Open a case, add observables, classify severity per Incident Commander matrix.
4. **For false positives:** Consider tuning the detection rule. Log the FP as a tuning signal.

### Phase 2 — Classify Severity (Incident Commander matrix)
5. **Assign severity using the SEV1–SEV4 matrix.** Be conservative: when in doubt between two severities, choose the higher one.
6. **Notify per severity.** SEV1/SEV2 require immediate escalation to the operator and relevant system owners.

### Phase 3 — Respond
7. **Run existing runbook if the scenario matches.** Known malware family, phishing pattern, C2 beacon — follow the established runbook.
8. **If no runbook exists:** Document the novel scenario, apply containment best practices (all actions: operator-run per the security-inversion), and flag for runbook development.
9. **All containment actions are operator-executed.** cortex detects, classifies, and recommends containment; the operator runs the isolation, credential reset, or network block.

### Phase 4 — Document
10. **Case management.** Every SEV2+ incident gets an Elastic case with timeline, investigation notes, actions taken, and evidence collected.
11. **Post-incident review (Incident Commander).** After every SEV1/SEV2: timeline reconstruction, communication log, what went well, what went wrong, action items.

## Output Format
```
## Security Monitoring: [alert/incident ID]
Type: [triage / severity-classification / runbook / post-incident]
Severity: [SEV1/SEV2/SEV3/SEV4] · Confidence: [high/medium/low]
Method: [Elastic MCP triage → Incident Commander severity]
Runbook: [matched / none — flag for development]
Case: [opened/updated] → case ref
Containment: [recommended → operator executes] (the inversion)
Post-incident review: [pending/completed → lessons]
```

## Principles
- **Triage every alert, classify every incident.** No alert is ignored; no incident is left unclassified.
- **Severity by impact, not by volume.** A SEV1 is a SEV1 whether it's one alert or 50.
- **Known scenarios get runbooks; unknowns get escalation.**
- **cortex detects and recommends; the operator contains.** The security-inversion holds for response.
- **Every SEV2+ gets a post-incident review.** No post-mortem, no learning.

## Fallback
- No SIEM access → manual monitoring log, labeled "manual — no SIEM." Flag as a risk to warden.
- No Elastic MCP skill → use Incident Commander framework alone, labeled "without SIEM integration — reasoning-based."
- No Incident Commander skill → use Elastic MCP alone with general severity mapping, labeled "provisional severity framework."

## Boundaries with Other Skills
- **detection-engineering** (sibling): detection rules generate the alerts this skill triages; tuning feedback flows back.
- **security-incident-response** (sibling): SEV1/SEV2 incidents escalate to IR; this skill handles triage, IR handles response.
- **threat-hunting** (sibling): hunts may generate leads that become monitoring alerts.
- **bastion**: network anomalies detected here feed bastion's network security reviews.
- **ops (Engineering)**: a joint security+reliability incident (e.g., ransomware) coordinates through the IR process.
- **warden**: monitoring gaps, untuned rules, and missed SLAs are register risks.
