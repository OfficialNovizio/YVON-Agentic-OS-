---
name: detection-engineering
agent: cortex
department: Cybersecurity
version: 1.1.0
tier: 2
description: |
  SOC alert triage, detection rule creation and tuning, false-positive management, and attack-discovery analysis for security operations (yvon)
triggers:
  - detection engineering
  - alert triage
  - detection rule
  - tune false positives
  - attack discovery
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/cortex/marketplace/detection-engineering/SKILL.md
  source_hash: dc60f949dca1647dd2ea84e210c15ef1c9101b2fbc18a489dc10e37d05f9ce11
  generated: 2026-07-20T03:23:08.105Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/cortex/marketplace/detection-engineering/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js cortex -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: cortex — Cybersecurity · skill: detection-engineering"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"cortex\",\"skill\":\"detection-engineering\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- Triage incoming security alerts and determine severity
- Create or modify detection rules based on threat intelligence
- Investigate potential security incidents with entity context
- Reduce false positive rates by tuning rules
- Test detection coverage with sample events
- Conduct attack discovery analysis across correlated alerts

## Purpose

Elastic Security MCP provides capabilities for SOC analysts and detection engineers to investigate, triage, and respond to security alerts, manage detection rules, and conduct attack discovery analysis. This skill integrates with Elastic Security's APIs to provide a comprehensive security operations workflow.

## Protocol

# Elastic Security MCP — Detection Engineering

## Introduction
Elastic Security MCP provides capabilities for SOC analysts and detection engineers to investigate, triage, and respond to security alerts, manage detection rules, and conduct attack discovery analysis. This skill integrates with Elastic Security's APIs to provide a comprehensive security operations workflow.

## Capabilities

### 1. Alert Triage
- Fetch and investigate security alerts from Elastic Security
- Classify threats and determine severity
- Create cases for confirmed incidents
- Investigate alert context and related events

### 2. Detection Rule Management
- Create new detection rules (query-based, threshold, machine learning, ESQL)
- Tune existing rules to reduce false positives
- Add exceptions to rules based on investigation findings
- Manage rule timing and schedule

### 3. Attack Discovery
- Correlate alerts into attack narratives
- Assess confidence based on entity risk and rule frequency
- Map findings to the MITRE ATT&CK framework
- Provide timeline reconstruction of attack sequences

### 4. Sample Event Generation
- Generate synthetic security events for testing detection rules
- Validate rule behavior before production deployment
- Create test datasets for benchmark testing

## When to Use
- Triage incoming security alerts and determine severity
- Create or modify detection rules based on threat intelligence
- Investigate potential security incidents with entity context
- Reduce false positive rates by tuning rules
- Test detection coverage with sample events
- Conduct attack discovery analysis across correlated alerts

## Workflow

### Alert Triage Workflow
1. Fetch recent alerts from Elastic Security (by severity, time range, or rule type)
2. Investigate each alert: check the event details, related entities, and historical context
3. Classify as: true positive, false positive, or needs further investigation
4. For true positives: open a case, add observables, assign to an analyst
5. For false positives: consider adding an exception or tuning the rule
6. Document findings and update alert status

### Detection Rule Management Workflow
1. Identify detection gaps (missing coverage for known TTPs)
2. Create rules using appropriate type (query, threshold, ML, ESQL)
3. Test rules against historical data
4. Enable and monitor rule performance
5. Review and tune regularly based on false positive rates

### Attack Discovery Workflow
1. Start with a suspicious entity (host, user, IP)
2. Pull all related alerts and events
3. Correlate events into a timeline
4. Map to MITRE ATT&CK techniques
5. Assess confidence based on evidence strength
6. Recommend next steps for investigation or containment

## Output Format
```
## Detection Analysis: [alert/entity/rule]
Type: [triage / rule-management / attack-discovery / event-generation]
Finding: [description of what was discovered or configured]
Confidence: [assessment based on evidence strength]
MITRE ATT&CK: [technique IDs if applicable]
Recommendation: [next steps or actions needed]
```

## Principles
1. **Triage thoroughly, classify decisively** — each alert gets investigated; ambiguous findings are escalated, not set aside.
2. **False positives are data, not noise** — every FP is an opportunity to tune a rule or close a detection gap.
3. **Test before deploying** — never enable a detection rule without validating against historical data.
4. **Correlation over isolation** — a single alert is a signal; correlated alerts tell a story.
5. **Document everything** — alert investigations, rule changes, and tuning decisions are logged.

## Boundaries & handoffs

DETECTION ─► detection-engineering (rules, SIEM tuning, false-positive mgmt)

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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"cortex\",\"skill\":\"detection-engineering\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
