---
name: cybersecurity-department-workflow
type: department workflow file (playbook §10)
department: Cybersecurity
status: built 2026-07-12, after all 5 agents completed (warden, keyring, bastion, cortex, veil)
agents: warden (CISO / Security Governance, leader) · keyring (Identity & Access Management) · bastion (Infrastructure & Cloud Security) · cortex (Security Operations — Detection & Response) · veil (Data Privacy & Protection)
---

## Summary

Cybersecurity is the CISO office: it secures **the company** — its cloud accounts, its people's access, its data, and its security operations — as distinct from Engineering, which secures **the product it ships**. Five agents organized in five pods: **warden** writes the security law (policy framework, risk register, third-party risk, exceptions), **keyring** owns human & infrastructure identity and access, **bastion** owns cloud/network/endpoint posture and infrastructure vulnerabilities, **cortex** owns security monitoring, detection, and breach incident response, and **veil** owns data classification, privacy, and data-loss prevention.

The department's signature inversion (mirroring "never move money" and Rail 3 discipline): **the security department is the most watched and least privileged in the fleet — it detects, assesses, and recommends, but the operator holds the keys and executes privileged changes.** Every risk is owned, treated, or explicitly accepted by the operator/board — never ignored.

## Purpose

Solve the enterprise/operational security gap that no other department owns: Engineering secures product code (aegis, cypher), AI & Agents secures agent identity (relay), and Governance monitors compliance (sentinel, board) — but nobody owns cloud posture, human IAM, security monitoring, data protection, or the security policy framework that ties it all together. Cybersecurity closes that gap.

## Working Structure

```
                              OPERATOR / BOARD
                                    ↑  (all execute action, acceptance, and escalation decisions)
                                    |
               WARDEN  (leader — identity: risk-owning-ciso)
        security-policy-framework → risk-register → third-party-risk → exception-process
                    |                     |                 |                 |
        framework defines         spine tracks        vendor/supply      time-boxed
        what "secure" means       every finding       chain risk         waivers
                    |                     |
                    ▼                     ▼
        ┌──────────┴──────────┐
        ▼                     ▼                     ▼
   KEYRING               BASTION                VEIL
   identity-lifecycle    cloud-posture          data-classification
   access-reviews        hardening-baselines    privacy-by-design
   PAM                   infra-vuln-mgmt        DLP
   secrets-governance    network-security       breach-notification
        │                     │                     │
        └──────────┬──────────┘─────────────────────┘
                   ▼
             CORTEX
        detection-engineering → security-monitoring
        → security-incident-response → threat-hunting
                   │
                   ▼
        ┌──────────┴──────────┐
        ▼                     ▼
    WARDEN REGISTER       OPERATOR (execute)
    (every finding        (containment, patching,
     is a tracked risk)    access changes, notifications)
```

## The Operating Loop

### 1. Define — warden sets the security law
Warden installs the marketplace GRC pack (GRCEngClub per config `control_standard`), maps controls to the business, assigns owners, and writes the policy set. Every gap is an entry in the risk register.

### 2. Posture — keyring, bastion, veil measure and detect
- **keyring**: Joiner-mover-leaver lifecycle (Hack23 policy + custom JML), access reviews on Hack23 cadence, PAM minimization, secrets governance (aj-geddes marketplace). Findings → warden's register.
- **bastion**: Cloud posture scans (marketplace CSPM), hardening baseline measurement, CVE scanning, network security reviews. Findings → warden's register. All remediation → operator/ops.
- **veil**: Data classification (Hack23 4-tier), privacy controls (Hack23 data-protection), DLP monitoring. Findings → warden's register. All enforcement → operator.

### 3. Watch — cortex detects and triages
Detection rules (Elastic Security MCP) generate alerts → security-monitoring triages per Incident Commander SEV1-SEV4 → SEV1/SEV2 escalate to IR. Threat hunts (mukul975 collection) proactively search for missed indicators.

### 4. Respond — cortex manages the incident lifecycle
Security incident response runs the 14-type MITRE-mapped IR lifecycle (thiagofernandes1987 + Incident Commander + aj-geddes). cortex recommends containment; the operator executes. DFRWS forensics. Regulatory notification via veil breach-notification.

### 5. Improve — everything feeds the register
Every gap, finding, incident lesson, and blind spot from all four operational agents flows to warden's risk register (merged Anthropic + Sentinel Stack + risk_score.py methodology). Risks are scored, treated, or accepted by the operator/board.

## The Security Inversion (department spine)

The single non-negotiable rule across all five agents:

> **The security department holds no keys and executes no privileged change.**

- warden writes policy → operator enforces
- keyring designs access → operator/IdP provisions
- bastion detects misconfigs → operator/ops remediates
- cortex triages incidents → operator contains
- veil identifies violations → operator blocks egress

This is enforced at every layer: each agent's principles, config's `executor` field, and tool requirements' "hard prohibition" section. A security agent that could silently change production access or isolate systems would itself be the largest attack surface.

## Cross-Department Boundaries

| Department | Boundary |
|---|---|
| **aegis/cypher** (Engineering — product security) | They own code/app vulns; Cybersecurity owns the company, cloud, people, data. A vuln in shipped code → aegis; a public S3 bucket → bastion. |
| **quinn** (Engineering — agent runtime) | Quinn enforces Security Charter rails on agents at runtime; warden sets org security policy for humans + infra. |
| **relay** (AI & Agents) | relay owns agent identity/tool-grants; keyring owns human + infra identity. One least-privilege doctrine, two subjects. |
| **sentinel/board** (Governance) | sentinel monitors compliance against locked commitments; warden owns security risk + controls. Security risk-acceptance routes to board; precedent archives. |
| **ops** (Engineering — reliability) | ops = outages + app-dependency patches; cortex = security incidents + infra/OS patches. Joint when both (ransomware → joint IR). |
| **dana** (Engineering — data stores) | dana designs stores; veil classifies data and sets protection rules; bastion secures network/access exposure. |

## Escalation

1. Any finding, gap, or incident → warden's risk register (tracked, scored, owned).
2. Risk acceptance above configured threshold → board (Governance). Precedent archives.
3. Material policy changes → anneal → board (Fleet Charter Rail 3).
4. Security incident (SEV1/SEV2) → operator immediate notification → board if material.
5. All privileged execution → operator (the inversion — no security agent self-executes).

## Department Status

| Agent | Skills | Identity | Operational | Logical | agent.md |
|---|---|---|---|---|---|
| **warden** | 4 skills (1 custom + 1 marketplace + 1 hybrid + 1 merge) | risk-owning-ciso (leader) | 5/5 files | placeholder | current |
| **keyring** | 4 skills (1 custom + 1 marketplace + 1 hybrid + 1 merge) | intentionally empty (non-leader) | 5/5 files | placeholder | current |
| **bastion** | 4 skills (1 custom + 2 marketplace-first + 1 merge) | intentionally empty (non-leader) | 5/5 built | placeholder | current |
| **cortex** | 4 skills (2 marketplace + 2 merge) | intentionally empty (non-leader) | 5/5 built | placeholder | current |
| **veil** | 4 skills (2 marketplace + 1 merge + 1 custom) | intentionally empty (non-leader) | 5/5 built | placeholder | current |

Department complete as of 2026-07-12. All 5 agents built with full operational layers. Pending: logical source books (all five), config fill-ins (all five), marketplace search confirmations for bastion's infra-vuln-management and network-security, and operator approval of GRCEngClub vs Hack23 pack preference.

## Skill Category Summary

| Agent | Custom | Marketplace | Custom + Marketplace | Merge |
|---|---|---|---|---|
| **warden** | 1 | 1 (+ 2 packs) | 1 | 1 |
| **keyring** | 1 | 1 | 1 | 1 |
| **bastion** | 1 | 1 (+ 1 pending) | 0 | 0 (2 marketplace-first) |
| **cortex** | 0 | 2 | 0 | 2 |
| **veil** | 1 | 2 | 0 | 1 |
| **TOTAL** | **4** | **7 (+ 2 packs)** | **2** | **5** |

Marketplace adoption rate: ~60% (up from ~5% in v1).
