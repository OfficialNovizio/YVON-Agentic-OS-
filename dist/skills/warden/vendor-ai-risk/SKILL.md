---
name: vendor-ai-risk
agent: warden
department: Cybersecurity
version: 1.1.0
tier: 2
description: |
  1. **Security** — infrastructure security, certifications, data handling, access controls 2. (yvon)
triggers:
  - vendor ai risk
  - is this ai vendor safe
  - what are the ai-specific risks
  - does this ai tool comply with our policies
allowed-tools:
  - <FILL_IN: not listed in warden-tool-requirements.md>
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: risk-owning-ciso
provenance:
  source_file: Teams/Cybersecurity/warden/marketplace/vendor-ai-risk/SKILL.md
  source_hash: 82d751b0c067c02fc444c038cef1b2f9f3ac42abdd9a31f95364f9d2dd30f598
  generated: 2026-08-08T19:52:18.914Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/warden/marketplace/vendor-ai-risk/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js warden -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: warden — Cybersecurity · skill: vendor-ai-risk"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"warden\",\"skill\":\"vendor-ai-risk\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- Assessing an AI vendor, LLM API, or AI-powered tool that processes business data.
- "Is this AI vendor safe," "what are the AI-specific risks," "does this AI tool comply with our policies."
- Supplementary to the primary Anthropic vendor-review skill for AI-specific dimensions.

## Purpose

Evaluate third-party AI vendors and tools across five specialized dimensions: security, privacy, AI-specific risks, contractual protections, and regulatory compliance. Designed for the growing category of AI vendor assessments that general vendor review skills don't cover — training data rights, model behavior guarantees, output ownership, and AI-specific regulatory obligations.

## Protocol

# Vendor AI Risk Assessment

## Introduction
Evaluate third-party AI vendors and tools across five specialized dimensions: security, privacy, AI-specific risks, contractual protections, and regulatory compliance. Designed for the growing category of AI vendor assessments that general vendor review skills don't cover — training data rights, model behavior guarantees, output ownership, and AI-specific regulatory obligations.

## When to Use
- Assessing an AI vendor, LLM API, or AI-powered tool that processes business data.
- "Is this AI vendor safe," "what are the AI-specific risks," "does this AI tool comply with our policies."
- Supplementary to the primary Anthropic vendor-review skill for AI-specific dimensions.

## Modes

### Quick Triage (5 minutes)
A fast red-flag screening for initial procurement filtering. Answers: "Should we spend more time on this vendor, or pass now?"

### Deep Due Diligence (full assessment)
Comprehensive evaluation with detailed risk scorecard (0-100 per dimension) and go/no-go recommendation.

## Five Assessment Dimensions

1. **Security** — infrastructure security, certifications, data handling, access controls
2. **Privacy** — data collection practices, retention, subprocessors, user consent
3. **AI-Specific Risks** — training data provenance, model behavior guarantees, output ownership, bias and fairness, explainability
4. **Contractual Protections** — indemnification, liability caps, SLA commitments, termination rights
5. **Regulatory Compliance** — GDPR, CCPA, AI Act readiness, sector-specific regulations

## Output Format
```
## AI Vendor Assessment: [vendor name]
Triage: [PASS / FLAG / NEEDS REVIEW]
Deep Due Diligence:
  Security: [score/100 · key findings]
  Privacy: [score/100 · key findings]
  AI-Specific: [score/100 · key findings]
  Contractual: [score/100 · key findings]
  Regulatory: [score/100 · key findings]
Overall: [Go / No-Go / Conditional] · Required amendments: [list]
```

## Boundaries
- Use alongside the primary **Anthropic vendor-review** for a complete vendor assessment.
- AI-specific findings feed warden's risk-register.
- Contractual findings coordinate with future Legal department.

## Output format

```

## Voice

Active identity: risk-owning-ciso — see `identity/risk-owning-ciso.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"warden\",\"skill\":\"vendor-ai-risk\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
