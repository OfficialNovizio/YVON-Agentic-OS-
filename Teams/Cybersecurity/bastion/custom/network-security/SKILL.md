---
name: network-security
type: custom (marketplace-first — search at build time per §4.1)
status: built 2026-07-12 — provisional; marketplace search required at deployment
based_on_catalog_entry: none — new; segmentation, firewall policy, zero-trust access (CYBERSECURITY-REDESIGN-PLAN-v2 §3.4)
marketplace_search:
  status: PENDING — to be searched at build time on skillsmp.com, mcpmarket.com, awesomeskill.ai
  candidates_to_search: network segmentation, firewall policy, zero-trust network access, network security
  note: Network security skills may exist as part of larger collections. Search by purpose. If a portable fit exists, adopt verbatim per §4.8. This provisional skill applies only if no fit is found.
assigned_agent: bastion (Cybersecurity / Infrastructure & Cloud Security)
portable: true
date_added: 2026-07-12
---

# Network Security

## Introduction
The design and maintenance of network security controls — segmentation, firewall/security group policy, zero-trust network access (ZTNA), and network monitoring — to limit blast radius and prevent lateral movement. bastion designs the network security architecture and detects gaps; the operator/ops implements the changes (the security-inversion).

## Purpose
The flat network is the enemy of security: if any system can reach any other system, a single compromised host becomes a full network compromise. Network security creates boundaries — segments, firewalls, micro-perimeters — so that a breach in one zone doesn't become a breach everywhere.

## When to Use
- Designing or reviewing network architecture for a new system or service.
- "Segment this network," "firewall rule review," "is our network secure."
- Network security review cadence.
- After a breach/incident that involved lateral movement (lessons → rule changes).

## Structure / Protocol
```
NETWORK INVENTORY (segments, subnets, traffic flows, trust zones)
  → SEGMENTATION REVIEW (are boundaries between trust zones enforced?)
    → FIREWALL/SG AUDIT (rules: least-privilege, unused, over-permissive)
      → ZTNA CHECK (is there implicit trust? can internal traffic move laterally unchecked?)
        → MONITORING REVIEW (are network anomalies detected? → feeds cortex)
          → FINDINGS (gaps → warden's register) + RECOMMENDATIONS (bastion specs; operator/ops applies)
```

## Instructions
1. **Map trust zones.** Identify segments by data sensitivity (per veil's classification) and function (public-facing, internal-service, data-store, admin, developer, corporate). Every network should have at least: public → application → data tier, with boundaries between them.
2. **Review segmentation.** Can a compromised web server reach the database directly? Can a developer laptop reach production? If yes, segmentation is insufficient — recommend network ACLs, security groups, or separate VPCs.
3. **Audit firewall/security group rules.** Least-privilege: a rule allowing 0.0.0.0/0 (any IP) on any port is a finding. Rules without a documented business owner and purpose are candidates for removal. Rules with no hits in 90+ days are candidates for removal.
4. **Zero-trust network access.** No implicit trust based on network location. Every connection is authenticated and authorized. Internal traffic is not assumed safe — micro-segmentation and per-request auth where feasible.
5. **Monitor.** Network anomalies (unexpected outbound connections, data exfiltration volumes, new protocols on unusual ports) feed cortex's detection-engineering. If you can't see the traffic, you can't detect the breach.
6. **bastion specs; operator/ops applies.** The inversion — bastion designs and audits; the operator or ops deploys firewall rules, configures network ACLs, and implements segmentation changes.

## Output Format
```
## Network Security Review: [scope] — [date]
Trust zones: [list with data sensitivity per veil]
Segmentation: [public→app: enforced / app→data: enforced / admin→prod: gated]
Firewall/SG rules: [total · over-permissive · no-owner · unused >90d]
ZTNA: [implicit trust found · micro-segmentation status]
Findings: [gap · zone · severity · recommendation]
→ operator/ops implements · → warden register for risks
```

## Principles
- **Segmentation is foundational.** Flat networks are indefensible; boundaries are the blast-radius limit.
- **Least-privilege in every rule.** Firewall rules have a specific source, destination, port, and purpose — no any/any.
- **No implicit trust.** ZTNA: location does not grant access; every connection is authenticated.
- **Audit on cadence.** Rules accumulate; stale rules are attack surface.
- **If you can't see it, you can't detect it.** Network monitoring is a prerequisite for cortex.
- **bastion specs; operator/ops applies.** The inversion.

## Fallback
- No network diagram / asset inventory → start with what's discoverable (cloud console, scans), labeled "provisional — partial visibility." Flag incomplete inventory as a risk.
- Legacy flat network → recommend segmentation with a time-boxed migration plan and compensating controls (host-level firewalls, application-layer auth) in the interim.
- Unable to enforce segmentation technically → document the gap, recommend compensating controls, route to warden as a risk.

## Boundaries with Other Skills
- **cloud-posture** (sibling): finds cloud SG/security group misconfigs (public buckets, open ports). This skill designs the network policy those checks verify against.
- **hardening-baselines** (sibling): host-level firewall rules are a hardening baseline; network-level segmentation is this skill.
- **infra-vuln-management** (sibling): network segmentation contains blast radius of unpatched systems — these two skills are complementary.
- **cortex** (Cybersecurity): network monitoring feeds detection; a breach involving lateral movement triggers network security lessons.
- **veil** (Cybersecurity): trust zones are defined by data sensitivity per veil's classification.
- **ops (Engineering)**: implements network changes through the deploy gate.
- **warden**: network gaps (flat segments, over-permissive rules, no monitoring) are register risks.
