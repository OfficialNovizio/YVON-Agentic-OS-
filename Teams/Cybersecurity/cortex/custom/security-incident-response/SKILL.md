---
name: security-incident-response
type: custom (merge — thiagofernandes1987 incident-response + Incident Commander + aj-geddes IR plan)
status: built 2026-07-12
based_on_catalog_entry: none — new; breach/compromise IR lifecycle (CYBERSECURITY-REDESIGN-PLAN-v2 §4.3)
sources_merged:
  - thiagofernandes1987 incident-response (skillsmp.com/skills/thiagofernandes1987-create-apex-skills-engineering-security-incident-response-skill-md) — 14 incident types mapped to MITRE ATT&CK. DFRWS six-phase forensic framework. Regulatory notification (GDPR 72h, PCI-DSS, HIPAA). False positive filtering (CI/CD, test envs, scanners). Tabletop exercise simulation.
  - Incident Commander (skillsmp.com/ar/creators/devcharuzu/philfida-taskmanage/windsurf-skills-incident-commander) — Runbook integration, communication templates, timeline reconstruction, post-incident reviews, severity classification (SEV1-SEV4).
  - Incident Response Plan (skillsmp.com/pt/creators/aj-geddes/useful-ai-prompts/skills-incident-response-plan) — Structured playbooks for detection, containment, eradication, and recovery phases.
note: Marketplace sources are integrated into this custom merge per playbook §4.6 and §4.8. This skill adds fleet-specific overlay: the "operator executes containment" security-inversion and the "cortex = security IR, ops = reliability IR, joint when both" boundary.
assigned_agent: cortex (Cybersecurity / Security Operations)
portable: true
includes: scripts/incident_timeline.py (tested — self-tests built in)
date_added: 2026-07-12
---

# Security Incident Response

## Introduction
The mechanized response to security incidents — from detection through containment, eradication, recovery, and lessons. Combines **thiagofernandes1987 incident-response** (14 MITRE-mapped types, DFRWS forensics, regulatory notification), **Incident Commander** (runbook integration, communications, post-incident reviews), and **aj-geddes Incident Response Plan** (structured containment/eradication/recovery playbooks). The fleet-specific overlay enforces the security-inversion (cortex detects/recommends, operator contains) and the hard boundary between security incidents (cortex) and reliability incidents (ops).

**Primary methodology:** thiagofernandes1987 incident-response (14-type MITRE mapping, DFRWS forensics, regulatory clocks). **Runbook/communications:** Incident Commander. **Recovery playbooks:** aj-geddes. **Fleet overlay:** custom.

## Purpose
When a security incident happens — a breach, a compromise, a data leak — the quality of the response determines the damage. A structured, pre-planned, well-practiced IR process reduces dwell time, limits blast radius, ensures evidence is preserved for forensics, and meets regulatory notification clocks. Without it, response is panicked, ad-hoc, and expensive.

## When to Use
- A security incident is confirmed (SEV1/SEV2 from security-monitoring triage).
- "We've been breached," "confirmed compromise," "ransomware," "data leak."
- Tabletop exercise to practice the IR plan.
- Post-incident review / lessons learned.

## Classification — 14 Incident Types (thiagofernandes1987, MITRE ATT&CK mapped)

| # | Type | MITRE ATT&CK | Description |
|---|---|---|---|
| 1 | **Ransomware** | T1486 | Encrypting data for ransom |
| 2 | **Data Exfiltration** | T1048 | Unauthorized data transfer out |
| 3 | **Account Compromise** | T1078 | Credential theft or misuse |
| 4 | **Phishing / Social Engineering** | T1566 | Deceptive credential harvesting |
| 5 | **Malware Infection** | T1204 | Unauthorized software execution |
| 6 | **Insider Threat** | T1529 | Malicious or negligent internal actor |
| 7 | **DDoS** | T1498 | Availability attack |
| 8 | **Web Application Attack** | T1190 | Exploitation of web vulnerabilities |
| 9 | **Supply Chain / Third-Party Incident** | T1195 | Breach at a vendor or partner |
| 10 | **Physical Security Breach** | T1056 | Unauthorized physical access |
| 11 | **Policy Violation** | — | Internal policy breach (non-malicious) |
| 12 | **Unauthorized Access** | T1078 | Access without proper authorization |
| 13 | **Misconfiguration** | T1562 | Security control weakened by config error |
| 14 | **Unknown / Emerging Threat** | — | Novel pattern not matching above types |

## Structure / Protocol

```
DETECTION (from security-monitoring triage — SEV1/SEV2 confirmed)
  → CLASSIFY incident type (14-type MITRE-mapped matrix)
    → CONTAIN (cortex recommends containment action → OPERATOR executes — the inversion)
      → INVESTIGATE (DFRWS six-phase forensics: identification → preservation → collection → examination → analysis → reporting)
        → ERADICATE (remove threat from environment — operator-executed)
          → RECOVER (restore normal operations — per aj-geddes playbooks, operator-executed)
            → REGULATORY NOTIFICATION (check clocks per type: GDPR 72h, PCI-DSS, HIPAA — coordinate with veil breach-notification)
              → POST-INCIDENT REVIEW (Incident Commander timeline, lessons, action items)
                → LESSONS → warden's risk register (control improvement)
```

## Instructions

### Phase 1 — Classify (thiagofernandes1987)
1. **Identify the incident type** from the 14-type MITRE-mapped matrix. More than one type may apply (e.g., ransomware often involves data exfiltration).
2. **Check false positive filters** (thiagofernandes1987): CI/CD agents, test environments, vulnerability scanners, known baseline behaviors. A detection that matches a known benign pattern is not an incident — but document the rule tuning need.

### Phase 2 — Contain (fleet inversion)
3. **cortex recommends containment; the operator executes.** cortex determines the appropriate containment action: isolate the host, revoke credentials, block the IP, disable the account. The operator applies it — cortex sends the recommendation, it does not execute it (the security-inversion).
4. **Containment is not optional.** Even before full investigation, the affected asset is contained to prevent lateral movement or further data loss.

### Phase 3 — Investigate (DFRWS forensics / thiagofernandes1987)
5. **DFRWS six-phase forensic framework:**
   - **Identification** — what happened, what systems are affected, what's the scope
   - **Preservation** — ensure evidence is not modified (memory capture, disk imaging, log保全)
   - **Collection** — gather relevant logs, system state, network flows
   - **Examination** — analyze collected data for indicators of compromise
   - **Analysis** — determine root cause, timeline, data accessed
   - **Reporting** — document findings for stakeholders and potential legal/regulatory use

### Phase 4 — Eradicate & Recover (aj-geddes + operator)
6. **Eradication:** Remove the threat from the environment — malware removal, account revocation, backdoor closure. Operator-executed.
7. **Recovery:** Restore affected systems from known-good backups. Verify integrity before returning to production. Per aj-geddes playbooks.

### Phase 5 — Notify (thiagofernandes1987 + veil coordination)
8. **Regulatory notification clocks:** Check applicable obligations per incident type:
   - **GDPR**: 72 hours from awareness
   - **PCI-DSS**: 24 hours for cardholder data incidents
   - **HIPAA**: 60 days (or sooner depending on scope)
   - **Coordinate with veil's breach-notification skill** for jurisdiction-specific obligations.

### Phase 6 — Post-Incident (Incident Commander)
9. **Post-incident review:** Timeline reconstruction, communication log, what went well, what went wrong, action items with owners and due dates.
10. **Lessons → warden:** Every incident produces lessons that update the risk register and improve controls. A repeat incident is a process failure.

## Output Format
```
## Incident Response: [incident ID] — [type per 14-type matrix]
Severity: [SEV1/SEV2] · Status: [contained / investigating / eradicated / recovered / closed]
MITRE ATT&CK: [technique IDs]
Containment: [action recommended → operator executed: y/n]
Forensics (DFRWS): [phase · key findings]
Regulatory: [clocks identified · notified? · deadline]
Post-incident review: [scheduled / complete → lessons → warden]
```

## Principles
- **Contain first, investigate second** — limit blast radius before root cause analysis.
- **cortex recommends; operator contains** — the security-inversion holds in a crisis.
- **Evidence preservation before remediation** — don't clean up before forensics.
- **Regulatory clocks start at awareness** — notification obligations are tracked from first confirmation.
- **Post-incident review is mandatory** — no SEV1/SEV2 closes without lessons.
- **Security incidents (cortex) vs reliability incidents (ops)** — ransomware is both; joint IR, cortex leads eradication/forensics, ops leads recovery.

## Fallback
- No forensics tools available → document findings and preservation steps manually; flag the gap to warden.
- Regulatory obligation unknown → flag as "[REGULATORY CLOCK] — check jurisdiction" and escalate to operator.
- Joint incident with ops (outage + breach) → establish joint command: ops leads service recovery, cortex leads threat eradication/forensics.
- Tabletop exercise mode → simulated incident with no production action; walk through classification → containment recommendation → investigation → notification → review.

## Boundaries with Other Skills
- **security-monitoring** (sibling): triage queue feeds SEV1/SEV2 into this skill for full IR.
- **threat-hunting** (sibling): threat hunts may directly discover an active compromise, bypassing monitoring triage.
- **detection-engineering** (sibling): IR findings may trigger new detection rules or tuning.
- **veil's breach-notification** (Cybersecurity): coordinates regulatory notification clocks per jurisdiction.
- **ops (Engineering)**: joint security+reliability incidents use this IR process; ops leads recovery, cortex leads forensics.
- **warden**: incident lessons are register entries; repeat incidents indicate control failures.
- **board (Governance)**: material security incidents (data breach, regulatory fine risk) escalate to board per risk-acceptance threshold.
