---
name: detection-engineering
type: marketplace (verbatim copy — unaltered per playbook §4.8)
source: Elastic (official Elastic Security MCP)
source_url: https://skillsmp.com/creators/elastic/example-mcp-app-security
status: verbatim copy of Elastic Security MCP skill
assigned_agent: cortex (Cybersecurity / Security Operations)
fulfills_catalog_entry: detection-engineering — alert triage, detection rule management, false positive tuning (CYBERSECURITY-REDESIGN-PLAN-v2 §4.1)
note_from_build: This is a verbatim marketplace adoption, unaltered. Covers alert triage, detection rule creation/tuning, false positive management, exception addition, attack discovery triage, entity risk assessment, and sample event generation for testing. Official Elastic skill. Supplementary detection use-cases available from mukul975's 817-skill collection.
portable: true
date_added: 2026-07-12
# yvon-compile metadata (auto-derived from skill Introduction 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "SOC alert triage, detection rule creation and tuning, false-positive management, and attack-discovery analysis for security operations"
triggers: [detection engineering, alert triage, detection rule, tune false positives, attack discovery]
---

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
