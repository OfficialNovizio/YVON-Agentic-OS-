---
name: infra-vuln-management
type: custom (marketplace-first — search at build time per §4.1)
status: built 2026-07-12 — provisional; marketplace search required at deployment
based_on_catalog_entry: none — new; OS/cloud/infra CVE scanning and patch cadence (CYBERSECURITY-REDESIGN-PLAN-v2 §3.3)
marketplace_search:
  status: PENDING — to be searched at build time on skillsmp.com, mcpmarket.com, awesomeskill.ai
  candidates_to_search: vulnerability management, vuln scanning, CVE management, OS patching, patch cadence
  note: Vulnerability scanning is a well-established marketplace category. A portable, vendor-neutral vuln-management skill may exist. If found, adopt verbatim per §4.8. This provisional skill applies only if no fit is found.
assigned_agent: bastion (Cybersecurity / Infrastructure & Cloud Security)
portable: true
includes: scripts/severity_score.py (tested — self-tests built in)
date_added: 2026-07-12
---

# Infrastructure Vulnerability Management

## Introduction
The disciplined management of CVEs and security vulnerabilities across OS, cloud infrastructure, and in-house systems — distinct from application dependencies (which ops patches) and code-level vulnerabilities (which aegis handles). This skill covers the scan cadence, severity classification, patch SLAs, and exception process for infra-level findings.

## Boundary (Critical)
- **ops (Engineering)** patches **app dependencies** (npm/pip/maven packages, library CVEs in shipped code).
- **bastion patches infra/OS/cloud** (kernel, OS packages, cloud service configs, container base images).
- **aegis (Engineering)** handles **code-level vulnerabilities** (SAST/DAST findings in application code).
- This skill covers infra/OS only. If a finding crosses boundaries (e.g., an OS vuln in a container running app code), coordinate with ops/aegis — don't assume ownership.

## Purpose
Unpatched infrastructure is the most common initial access vector in real breaches. A structured vulnerability management program — with defined scan cadences, severity thresholds, patch SLAs, and exception processes — turns "we need to patch" from a fire drill into a routine.

## When to Use
- A new CVE is published affecting the infrastructure stack.
- Schedule-driven vulnerability scan.
- "Are we vulnerable to X," "what's our patch status," "CVE-202X-XXXX."
- Patch compliance reporting.

## Structure / Protocol
```
SCAN (on cadence: OS packages, cloud infra services, container base images, network appliances)
  → IDENTIFY (CVE · affected asset · severity per CVSS or vendor)
    → CLASSIFY (critical/high/medium/low per CVSS + business context)
      → PRIORITIZE (severity × exploitability × asset criticality)
        → TREAT (patch → ops/operator / mitigate → compensating control / accept → warden exception)
          → TRACK (finding status: open / patched / exception-approved / false-positive)
            → REPORT (patch compliance, SLA adherence, trends)
```

## Instructions
1. **Scan on cadence.** OS packages weekly, cloud infra monthly, container base images per build. Scans are scheduled, not ad-hoc.
2. **Severity per CVSS + business context.** A critical CVE on an internet-facing system is an emergency; the same CVE on an isolated internal system is high. Never downgrade severity on a CVE without documenting the business context.
3. **Patch SLAs (configurable, operator-set):**
   - **Critical** — patch within 7 days (or isolate with compensating control)
   - **High** — patch within 30 days
   - **Medium** — patch within 90 days
   - **Low** — patch by next scheduled cycle
4. **Exceptions are time-boxed.** A patch that can't be applied within SLA gets an exception through warden's security-exception-process — compensating control, expiry, owned.
5. **Coordinate with ops.** For joint infra+app vulns, ops leads the patch, bastion tracks the finding. Don't patch app deps yourself.
6. **Track everything.** Every CVE is a finding until the asset is confirmed patched. Partial patching (asset still reachable with old version) is not resolved.
7. **Trend reporting.** Patch compliance %, mean-time-to-patch, overdue exceptions — these metrics surface to warden and the operator on cadence.

## Output Format
```
## Vuln Scan: [scope] — [date]
Tool: [scanner name] · Assets scanned: [count]
Findings:
  Critical: [count] — top CVE: [ID · asset · CVSS · SLA due]
  High: [count] — top CVE: [ID · asset · CVSS · SLA due]
  Medium: [count] · Low: [count]
Patch compliance: [critical: X% within SLA · high: X% within SLA]
Overdue exceptions: [count → warden]
Trend vs last scan: [improving/declining/stable]
```

## Principles
- **Scan on cadence, not on fire.** Scheduled scanning prevents emergency patching.
- **CVSS + business context** — severity is not just a number.
- **Patch SLAs are binding** — critical = 7 days, no silent slippage.
- **Exceptions go through warden.** No self-approved patch delays.
- **Track everything.** An unpatched CVE without a tracking entry is invisible.
- **Boundary with ops is hard.** Infra vs app-dependency is a defined seam, not a judgment call.

## Fallback
- No vuln scanner deployed → manual CVE tracking against asset inventory, labeled "manual — no scanner." Flag as a risk to warden.
- Can't patch within SLA → route to warden's exception process immediately — don't let the SLA lapse silently.
- Scanner coverage gap (some assets not scanned) → flag as a finding; partial coverage is a known risk.

## Boundaries with Other Skills
- **cloud-posture** (sibling): CSPM covers cloud misconfigs; this skill covers infra CVEs. A public S3 bucket = cloud-posture; a critical CVE on the EC2 instance hosting the app = this skill.
- **hardening-baselines** (sibling): baselines define the secure config; vuln management tracks the patch status against them.
- **network-security** (sibling): network segmentation contains blast radius of unpatched systems.
- **warden**: overdue patches, expired exceptions, and SLA breaches are register risks.
- **ops (Engineering)**: joint infra+app findings coordinate here; ops patches app deps separately.
- **aegis (Engineering)**: app/code-level vulns go to aegis, not here.
