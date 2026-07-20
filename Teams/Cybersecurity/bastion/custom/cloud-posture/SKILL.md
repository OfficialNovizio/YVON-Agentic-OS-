---
name: cloud-posture
type: custom
status: built 2026-07-10 (Fable)
based_on_catalog_entry: none — new; CSPM misconfig detection (plan §3)
marketplace_search: 2026-07-10 — CSPM is dominated by vendor products (Wiz/Prisma/Defender); no portable agent-skill fit; kept custom, aligned to CIS Benchmarks + cloud-provider security baselines (cited). GRC CIS Controls pack (Sushegaad) is a reference.
assigned_agent: bastion (Cybersecurity / Infrastructure & Cloud Security)
portable: true — the checks are provider-agnostic in principle; the cloud is config (stack-profile)
includes: assets/cspm-checklist.md
date_added: 2026-07-10
---

# Cloud Security Posture (CSPM)

## Introduction
Detecting the misconfigurations on the business's cloud accounts before an attacker does — public storage buckets, open security groups, over-permissive IAM policies, unencrypted volumes, disabled logging. bastion **detects and specs the fix**; the operator (or ops through the normal gate) remediates — bastion holds no cloud keys (the security-inversion).

## Purpose
The overwhelming majority of cloud breaches are misconfigurations, not exploits — a public S3 bucket, a database open to the internet, an IAM role that can do everything. CSPM continuously checks the cloud's configuration against secure baselines so these are found and fixed as routine, not discovered in a breach report.

## When to Use
- A cloud account exists (per the stack-profile's hosting).
- "Is our cloud secure," "check for misconfigs," "public bucket," "open port," "over-permissive role."
- Posture scan cadence; after any infra change.

## Structure / Protocol
INVENTORY (the cloud accounts/resources — per stack-profile hosting) → CHECK against baselines (CIS Benchmarks + provider security best-practices: storage not public, security groups least-open, IAM least-privilege, encryption on, logging/audit-trail enabled, MFA on root/org) → PRIORITIZE (findings by exposure × data-sensitivity — a public bucket with PII outranks a dev misconfig) → SPEC THE FIX (bastion writes the remediation; operator or ops-through-the-gate applies it — bastion doesn't hold cloud admin) → RISK (findings → warden's register; over-permissive cloud IAM also flags to keyring's doctrine) → RE-CHECK (drift: a fixed misconfig that reappears is a finding).

## Instructions
1. **Check against real baselines.** CIS Benchmarks and the cloud provider's security best-practices — not opinion. The GRC CIS Controls pack (Sushegaad) is the reference catalog; provider docs are dated (like ops's playbooks — cloud services change).
2. **The classic misconfigs first.** Public storage, internet-open databases/ports, over-permissive IAM, no encryption at rest, disabled audit logging, root/org accounts without MFA — these are the breach headlines; check them every scan.
3. **Prioritize by exposure × data sensitivity.** A public bucket holding customer PII (veil's classification) is critical; the same misconfig on empty dev infra is low. Risk-based, not raw-count.
4. **bastion detects and specs; the operator/ops remediates.** bastion writes the exact fix; applying it to the cloud account goes through the operator or ops's normal deploy gate — bastion holds no cloud admin credentials (the inversion; cloud IAM is the ultimate blast radius).
5. **Findings are register risks.** Each misconfig scores into warden's register; over-permissive cloud IAM is also a least-privilege failure keyring's doctrine covers (cloud identity ↔ human identity seam).
6. **Watch for drift.** A remediated misconfig that reappears means a process gap (IaC not updated, manual change) — that's a finding, not just a re-fix.

## Output Format
```
## Cloud Posture: [account] — baseline: [CIS + provider]
Findings: [misconfig · resource · exposure · data-sensitivity · severity]
Classic checks: [public storage · open SG/ports · IAM least-priv · encryption · logging · root MFA]
Fix spec → [operator / ops gate] (bastion detects, doesn't apply)
Risks → warden register · over-permissive cloud IAM → keyring doctrine · drift flags
```

## Principles
- **Check against real baselines** (CIS + provider), dated, not opinion.
- **The classic misconfigs are the breach headlines** — check them every scan.
- **Prioritize by exposure × data sensitivity** — risk-based, not raw count.
- **bastion detects + specs; operator/ops remediates** — no cloud keys (the inversion).
- **Findings are register risks; drift is a finding.**

## Fallback
- No CSPM tooling → manual checks against the CIS Benchmark for the provider, prioritized to the classic high-blast misconfigs, labeled manual; recommend a CSPM connector to the operator.
- Multi-cloud → one baseline per provider; shared findings (public storage, IAM) factored; the seams between clouds are extra attack surface, flagged.

## Boundaries with Other Skills
- **hardening-baselines** (sibling): host/OS/endpoint config; this is the cloud control-plane config.
- **network-security** (sibling): security groups/segmentation overlap — cloud SG misconfigs are found here, network policy designed there.
- **keyring**: over-permissive cloud IAM is a least-privilege failure (cloud identity seam).
- **ops (Engineering)**: remediation ships through ops's gate; ops's maintenance-hygiene patches, bastion checks config.
- **veil**: data-sensitivity of what a misconfigured resource exposes comes from veil's classification.
- **warden**: all findings are register risks.
