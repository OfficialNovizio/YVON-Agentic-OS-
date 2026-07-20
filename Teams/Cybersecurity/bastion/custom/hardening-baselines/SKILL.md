---
name: hardening-baselines
type: custom
status: built 2026-07-10 (Fable)
based_on_catalog_entry: none — new; CIS-style config baselines for OS/cloud/endpoints (plan §3)
marketplace_search: 2026-07-10 — hardening is CIS-Benchmark-driven; the GRC CIS Controls pack (Sushegaad, MIT) is the reference catalog (adopted-by-reference); the baseline-application discipline is kept custom.
assigned_agent: bastion (Cybersecurity / Infrastructure & Cloud Security)
portable: true — baselines are per-platform (dated); the discipline is universal
includes: (no asset — method skill; references CIS Benchmarks)
date_added: 2026-07-10
---

# Hardening Baselines

## Introduction
Secure configuration baselines for the things the business runs — servers/OS, cloud services, endpoints (laptops), containers — so they ship locked down instead of default-open. bastion defines the baseline (from CIS Benchmarks), measures actual config against it, and specs the gaps; the operator/ops applies the hardening.

## Purpose
Defaults are convenient, not secure — a default OS install, an unhardened container image, a laptop with no disk encryption. A defined baseline turns "is this configured securely" into a measurable check, and closes the drift between "how it should be set up" and "how it actually is."

## When to Use
- Provisioning a new server/service/endpoint/image.
- "Harden this," "config baseline," "is this box secure," "CIS benchmark."
- Baseline compliance scan on cadence; after config changes.

## Structure / Protocol
DEFINE (the baseline per platform, from CIS Benchmarks: OS, cloud service, container, endpoint — dated, because platforms change) → MEASURE (actual config vs baseline → deviations) → PRIORITIZE (deviations by exploitability × exposure) → SPEC (bastion writes the hardening; operator/ops applies — via IaC where possible so it's repeatable, not manual) → ENDPOINTS (laptops: disk encryption, screen lock, patch level, EDR — the human-device attack surface) → RE-MEASURE (drift: config that reverts to insecure is a finding + a process gap).

## Instructions
1. **Baseline from CIS, per platform, dated.** CIS Benchmarks are the reference; each platform's baseline carries an as-of date (cloud/OS versions change — the volatility split, security edition). The GRC CIS Controls pack is the catalog.
2. **Measure, don't assume.** Actual config vs baseline produces deviations; "we hardened it" without a measurement is a claim, not a fact (the fleet's evidence rule, infra edition).
3. **Baselines apply via IaC where possible.** Hardening baked into infrastructure-as-code is repeatable and drift-resistant; manual hardening decays. bastion specs it; ops/dev implement the IaC.
4. **Endpoints count.** Employee laptops are infrastructure too: disk encryption, screen-lock, current patches, endpoint protection. A compromised unhardened laptop is a common breach entry (cortex responds to endpoint compromise).
5. **bastion specs; operator/ops applies.** The inversion — bastion measures and writes the hardening, the operator or ops's gate applies it to real systems.
6. **Drift is a finding.** Config that reverts to insecure (a manual change, an un-updated image) is a process gap, surfaced to warden, not just re-hardened each scan.

## Output Format
```
## Hardening: [platform/asset] — baseline: [CIS, as-of date]
Deviations: [setting · current · baseline · exploitability · exposure]
Endpoints: [disk-encryption · lock · patch level · EDR] (if applicable)
Fix spec → [operator / ops IaC] (bastion measures, doesn't apply)
Drift: [reverted settings → process-gap finding] · Risks → warden
```

## Principles
- **Baseline from CIS, per platform, dated** — versions change.
- **Measure, don't assume** — "hardened" needs evidence.
- **Apply via IaC** — repeatable, drift-resistant; manual decays.
- **Endpoints are infrastructure** — laptops are a common entry point.
- **bastion specs; operator/ops applies** — the inversion.
- **Drift is a process-gap finding** — not a per-scan re-fix.

## Fallback
- No CIS tooling → apply the CIS Benchmark checklist manually for the platform, prioritized to high-exploitability settings, labeled manual.
- No IaC → hardening is manual + documented + re-measured on cadence (drift-prone, flagged); recommend IaC to dev/ops.

## Boundaries with Other Skills
- **cloud-posture** (sibling): cloud control-plane config; this is host/OS/endpoint/container config.
- **infra-vuln-management** (sibling): patching (a hardening dimension) — this is config, that is CVEs.
- **ops (Engineering)**: applies hardening via its gate/IaC; ops maintenance-hygiene patches, bastion baselines config.
- **cortex**: endpoint compromise triggers its response; **warden**: deviations + drift are register risks.
