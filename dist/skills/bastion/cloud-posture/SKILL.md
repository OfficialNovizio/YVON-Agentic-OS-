---
name: cloud-posture
agent: bastion
department: Cybersecurity
version: 1.5.0
tier: 2
description: |
  **Supported Standards:** - CIS AWS Foundations Benchmark - PCI DSS - NIST SP 800-53 - AWS Foundational Security Best… (yvon)
triggers:
  - cloud posture
  - is our cloud secure
  - check for misconfigs
  - public bucket
  - open port
  - over-permissive iam
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/bastion/marketplace/cloud-posture/SKILL.md
  source_hash: 5c9c3a703e10d0fcbe2d1f075377638c8ed141e13bd9c82b4d1e6839a63fe83c
  generated: 2026-07-20T03:20:23.017Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/bastion/marketplace/cloud-posture/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js bastion -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: bastion — Cybersecurity · skill: cloud-posture"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"bastion\",\"skill\":\"cloud-posture\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- A cloud account exists (AWS, Azure, or GCP).
- "Is our cloud secure," "check for misconfigs," "public bucket," "open port," "over-permissive IAM."
- Posture scan cadence; after any infrastructure change.
- Compliance benchmarking against CIS, PCI DSS, or NIST frameworks.

## Purpose

**Supported Standards:**
- CIS AWS Foundations Benchmark
- PCI DSS
- NIST SP 800-53
- AWS Foundational Security Best Practices

## Protocol

# Cloud Security Posture Management (CSPM)

## Introduction
Continuously monitor cloud infrastructure for misconfigurations, compliance violations, and security risks. Unlike traditional vulnerability scanning which focuses on OS/application CVEs, CSPM focuses on cloud-native risks: IAM over-permissions, exposed storage buckets, unencrypted data, missing network controls, and service misconfigurations.

## When to Use
- A cloud account exists (AWS, Azure, or GCP).
- "Is our cloud secure," "check for misconfigs," "public bucket," "open port," "over-permissive IAM."
- Posture scan cadence; after any infrastructure change.
- Compliance benchmarking against CIS, PCI DSS, or NIST frameworks.

## Supported Tools

### AWS Security Hub
AWS Security Hub provides a comprehensive view of your security state in AWS and helps you check your environment against security industry standards and best practices.

**Supported Standards:**
- CIS AWS Foundations Benchmark
- PCI DSS
- NIST SP 800-53
- AWS Foundational Security Best Practices

**Key Capabilities:**
- Aggregate findings from AWS services (GuardDuty, Inspector, Macie, IAM Access Analyzer)
- Automated compliance checks
- Consolidated security findings dashboard
- Automated remediation with AWS Config rules

### Azure Defender for Cloud
Azure Defender for Cloud provides unified security management and advanced threat protection across hybrid cloud workloads.

**Key Capabilities:**
- Continuous assessment of security configuration
- Compliance scoring against CIS, PCI DSS, NIST, and Azure benchmarks
- Just-in-time VM access
- Adaptive application controls
- File integrity monitoring
- Security alerts and advanced threat protection

### Prowler (Open Source)
Prowler is an open-source command-line tool for AWS, Azure, and GCP security assessments, following CIS benchmarks and beyond.

**Installation:**
```bash
# Install Prowler
pip install prowler
# or
git clone https://github.com/prowler-cloud/prowler && cd prowler && pip install -r requirements.txt
```

**Basic Usage:**
```bash
# Run all checks against an AWS account
prowler aws

# Run specific CIS checks only
prowler aws --checks cis_1.1 cis_1.2 cis_1.3

# Run against Azure
prowler azure

# Run against GCP
prowler gcp

# Output to CSV/JSON
prowler aws -M csv -o ./reports
```

**Common Checks:**
- S3 buckets public access
- Security groups with unrestricted ingress (0.0.0.0/0)
- IAM policies with full administrative privileges (*:*)
- CloudTrail enabled across all regions
- KMS key rotation enabled
- RDS instances publicly accessible

### ScoutSuite (Open Source)
ScoutSuite is a multi-cloud security-auditing tool that provides a comprehensive view of the security posture of AWS, Azure, and GCP environments.

**Installation:**
```bash
pip install scoutsuite
```

**Basic Usage:**
```bash
# Run against AWS
scout aws

# Run against Azure
scout azure --cli

# Run against GCP
scout gcp --user-account

# Generate HTML report
scout aws --report-dir ./reports
```

## Multi-Cloud CSPM Scan Procedure

### Phase 1 — Inventory
1. Identify all cloud accounts/providers in scope (per the stack-profile's hosting configuration).
2. Document the services and regions in use.
3. Identify any data sensitivity classifications (crown-jewel assets per veil's classification).

### Phase 2 — Scan
Run the appropriate tool for each cloud provider:
- **AWS**: Prowler (CIS checks) + AWS Security Hub (foundational best practices)
- **Azure**: Prowler (CIS checks) + Azure Defender for Cloud
- **GCP**: Prowler (CIS checks) + ScoutSuite

### Phase 3 — Analyze
Classify findings by severity and impact:
- **Critical**: Public storage with sensitive data, internet-open databases, root/org accounts without MFA
- **High**: Over-permissive IAM policies, unencrypted data at rest, disabled audit logging
- **Medium**: Unused security groups, non-standard configurations
- **Low**: Minor deviations from baseline

### Phase 4 — Remediate
For each finding:
1. Document the finding with resource identifier, severity, and impact.
2. Recommend the specific remediation action.
3. Assign to the appropriate team or operator for execution.
4. Track in the risk register.
5. Re-scan after remediation to confirm closure.

## Classic CSPM Checks (Run Every Scan)
1. **Public storage** — S3 buckets, Azure Blob containers, GCP storage buckets with public access
2. **Internet-open ports** — Security groups/firewall rules with 0.0.0.0/0 ingress for sensitive ports (22, 3306, 3389, 5432, 27017)
3. **Over-permissive IAM** — Policies with *:* effect, users/roles with full admin, unused permissions
4. **Encryption at rest** — Unencrypted EBS/RDS volumes, S3 buckets without default encryption
5. **Audit logging** — CloudTrail/logging disabled or misconfigured
6. **Root/org account security** — Root user without MFA, no organizational guardrails (SCPs)

## Output Format
```
## Cloud Posture Report: [provider/account] — [date]
Tool used: [Prowler / ScoutSuite / Security Hub / Defender]
Compliance benchmarks: [CIS · PCI DSS · NIST]
Findings:
  Critical: [count] — [top finding]
  High: [count] — [top finding]
  Medium: [count]
  Low: [count]
Classic checks: [public storage ✓ · open ports · IAM least-privilege · encryption · logging · root MFA]
Remediation priority: [critical/high findings with specific fix recommendations]
Re-scan: [date of next scheduled scan]
```

## Principles
1. **Check against real baselines** (CIS Benchmarks + provider best practices), not opinion.
2. **The classic misconfigs are the breach headlines** — check them every scan without fail.
3. **Prioritize by exposure × data sensitivity** — a public bucket with PII > the same misconfig on dev.
4. **Fix is spec'd, not applied** — CSPM detects and recommends; the operator/ops remediates.
5. **Findings are register risks** — every misconfig is a tracked risk in warden's register.
6. **Drift is a finding** — a remediated misconfig that reappears means a process gap.

## Fallback
- **No CSPM tooling available** → manual checks against CIS Benchmark for each provider, prioritized to the classic high-blast misconfigs. Labeled "manual check — no tool."
- **Tool access issues** (e.g., insufficient IAM permissions to scan) → flag as a finding itself; the inability to audit is a risk.
- **Multi-cloud** → one baseline per provider; shared findings across providers factored; seams between clouds flagged as extra attack surface.

## Boundaries with Other Skills
- **bastion's hardening-baselines** (sibling): cloud control-plane config (this skill) vs host/OS/endpoint config (hardening-baselines).
- **bastion's network-security** (sibling): cloud SG/security group misconfigs found here; network policy designed there.
- **warden's risk-register**: all findings are register risks.
- **veil's data-classification**: data sensitivity of exposed resources comes from veil's tiers.
- **keyring**: over-permissive cloud IAM is a least-privilege failure (cloud identity seam).
- **ops (Engineering)**: remediation ships through ops's deploy gate.

## Boundaries & handoffs

cloud posture scan ─► cloud-posture (CSPM: misconfig detection against CIS + provider baselines)

## Output format

```

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"bastion\",\"skill\":\"cloud-posture\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
