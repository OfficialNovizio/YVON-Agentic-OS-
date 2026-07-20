---
name: threat-hunting
type: marketplace (verbatim copy — unaltered per playbook §4.8)
source: mukul975 / Anthropic-Cybersecurity-Skills collection
source_url: https://skillsmp.com/creators/mukul975/anthropic-cybersecurity-skills
status: adopted from mukul975's 817-skill collection — key hunting playbooks referenced
assigned_agent: cortex (Cybersecurity / Security Operations)
fulfills_catalog_entry: threat-hunting — hypothesis-driven proactive search (CYBERSECURITY-REDESIGN-PLAN-v2 §4.4)
note_from_build: This skill is adopted from the mukul975 Anthropic-Cybersecurity-Skills collection (817 skills, MITRE ATT&CK + NIST CSF mapped). Individual hunting playbooks are selected per use case — BloodHound CE, Velociraptor fleet hunting, Falco runtime detection, Kerberoasting detection, ADCS abuse detection, DPAPI credential access, Shadow Credentials, container escape, Kubernetes RBAC auditing, network packet analysis with Scapy, and others. The collection is a referenced pack, not vendored in full. Supplementary collection: gaoqiongxie cybersecurity-skills (754 skills, MITRE ATT&CK v19.1, NIST CSF 2.0, MITRE ATLAS v5.4).
portable: true
date_added: 2026-07-12
# yvon-compile metadata (auto-derived from skill content 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "**Sourced from:** mukul975 Anthropic-Cybersecurity-Skills collection (817 skills, MITRE ATT&CK + NIST CSF mapped)."
triggers: [threat hunting, let's look for x, hunt for signs of y, are we compromised]
---

# Threat Hunting

## Introduction
Proactive, hypothesis-driven search for signs of compromise that existing detection rules may have missed. Unlike detection engineering (which waits for alerts) and incident response (which reacts to confirmed incidents), threat hunting actively looks for the unknown — subtle indicators, novel techniques, and evidence of adversaries who have evaded preventive controls.

**Sourced from:** mukul975 Anthropic-Cybersecurity-Skills collection (817 skills, MITRE ATT&CK + NIST CSF mapped). Individual hunting playbooks are selected and executed per the hunting hypothesis.

## Purpose
Detection rules are reactive — they can only find what they were written to detect. Threat hunting finds what the rules missed: novel attacker techniques, subtle indicators of compromise, and evidence of adversary presence that didn't trigger an alert. It's the difference between waiting for the alarm to go off and actively checking if someone is already inside.

## When to Use
- Scheduled hunt cadence (e.g., weekly or monthly).
- New threat intelligence about a specific technique or actor group.
- Post-incident — to check for related compromises not yet discovered.
- After major infrastructure changes — to verify no new vulnerabilities were introduced.
- "Let's look for X," "hunt for signs of Y," "are we compromised."

## Hunting Methodology

### Step 1 — Formulate Hypothesis
Start with a clear, testable hypothesis based on:
- **Threat intelligence** — new CVE, active campaign, emerging TTP
- **Internal trends** — increase in certain alert types, unusual network patterns
- **Post-incident lessons** — "if this adversary was here, what else might they have done?"
- **Frameworks** — MITRE ATT&CK techniques not currently covered by detection rules

### Step 2 — Identify Data Sources
Determine what data would contain evidence of the hypothesis:
- Endpoint logs (EDR, sysmon, osquery)
- Network logs (flows, DNS, proxy, Zeek)
- Cloud logs (CloudTrail, audit logs, access logs)
- Identity logs (authentication, directory changes)
- Application logs

### Step 3 — Execute Hunt
Run queries, scripts, and tools against the identified data sources:
- Use the mukul975 collection's specific playbook for the technique being hunted (BloodHound for Active Directory, Velociraptor for endpoint, Falco for runtime, Scapy for network)
- Document the query and results
- Note any baseline behaviors for context

### Step 4 — Analyze Findings
For each finding, determine:
- **Benign** — expected behavior, known baseline
- **Suspicious** — unusual but not clearly malicious; flag for monitoring
- **Malicious** — confirmed indicator of compromise → escalate to security-incident-response

### Step 5 — Operationalize
- Malicious findings → incident response
- Suspicious findings → new detection rule or monitoring enhancement
- No findings → document the negative result (absence of evidence is not evidence of absence)
- Every hunt produces: hypothesis, data sources, queries, findings, recommendations

## Common Hunting Scenarios (from mukul975 collection)

| Scenario | Tool/Technique | What to Look For |
|---|---|---|
| AD privilege escalation | BloodHound CE | Unexpected Kerberoastable accounts, DCSync paths, ACL abuse paths |
| Lateral movement | Velociraptor fleet hunt | Remote service creation, WMI/WinRM usage, PsExec execution |
| Container compromise | Falco runtime detection | Unexpected shell in container, mount namespace escape, suspicious syscalls |
| Credential theft | Kerberoasting detection | Unusual TGS-REQ counts, service account with SPN but no business need |
| ADCS abuse | Certipy techniques | Unusual certificate requests, ESC1-ESC8 indicators |
| DPAPI abuse | DPAPI forensic analysis | Unexpected DPAPI backup key access, credential file decryption |
| Network beaconing | Scapy/Zeek analysis | Periodic outbound connections, unusual protocols, suspicious DNS |
| Kubernetes RBAC abuse | K8s audit log analysis | Unusual role binding, sensitive resource access from unknown service accounts |

## Output Format
```
## Threat Hunt: [hypothesis] — [date]
Hypothesis: [what we looked for and why]
Data sources: [logs/tools queried]
Playbook: [mukul975 collection — specific skill used]
Findings:
  Malicious: [count → incident escalation]
  Suspicious: [count → monitoring enhancement]
  Benign: [count — or "no IOCs detected"]
Recommendations: [new rules, tuning, additional hunts]
Next hunt: [date of scheduled next hunt]
```

## Principles
1. **Hypothesis-driven, not random.** A hunt without a hypothesis is noise.
2. **Document the negative.** A hunt that finds nothing is still valuable — it means the hypothesis didn't materialize.
3. **Findings become detection rules.** Suspicious findings that don't warrant IR should trigger a new detection rule.
4. **Hunt what you can see; flag what you can't.** If the data to test a hypothesis doesn't exist, that's a logging gap — flag to warden.
5. **Coordinate with incident response.** A malicious finding escalates to full IR; threat hunting does not itself contain.

## Fallback
- No EDR / endpoint logs → hunt from network logs and cloud audit logs only, labeled "limited visibility — no EDR."
- No mukul975 collection installed → general hunting methodology applies; reference MITRE ATT&CK manually for hypothesis generation.
- Logging gap for a hypothesis → flag the gap, recommend log source adoption, hunt from available data.

## Boundaries with Other Skills
- **detection-engineering** (sibling): hunt findings that don't meet IR threshold become new detection rules.
- **security-monitoring** (sibling): hunts may produce leads that enter the monitoring triage queue.
- **security-incident-response** (sibling): malicious hunt findings escalate directly to IR.
- **bastion**: infrastructure-focused hunts (container, cloud) coordinate with bastion's infra scope.
- **warden**: logging gaps and blind spots identified by hunts are register risks.
