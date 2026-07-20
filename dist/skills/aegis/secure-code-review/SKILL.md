---
name: secure-code-review
agent: aegis
department: Engineering
version: 1.0.0
tier: 3
description: |
  Most breaches enter through code that passed a normal review — it looked correct because the reviewer wasn't reading as an attacker. (yvon)
triggers:
  - secure code review
  - security review this
  - is this change safe
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/aegis/custom/secure-code-review/SKILL.md
  source_hash: 57735c3b1a0cecb1db947aab1f2b1c705afbaa895f3554b89ad0e7f1e0ab8b9e
  generated: 2026-07-20T03:20:22.436Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/aegis/custom/secure-code-review/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js aegis -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: aegis — Engineering · skill: secure-code-review"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"aegis\",\"skill\":\"secure-code-review\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/aegis/operational/agent/aegis-config.md"
if [ -f "$_CFG" ]; then
  _FILLS=$(grep -c "<FILL_IN>" "$_CFG" 2>/dev/null || echo 0)
  echo "CONFIG: $_CFG"
  echo "CONFIG_UNFILLED_FIELDS: $_FILLS"
  if [ "$_FILLS" -gt 0 ]; then
    echo "⚠️ DEGRADE LOUDLY: $_FILLS config fields are <FILL_IN>. Ask the operator before relying on any of them — do NOT improvise values."
    grep -n "<FILL_IN>" "$_CFG" 2>/dev/null | head -10 || true
  fi
else
  echo "⚠️ CONFIG MISSING: $_CFG — every config-dependent decision must be asked, not assumed."
fi
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Triggers: dev's code-review-standards routing a risky surface here (the primary entry), "security review this," "is this change safe," auth/crypto/input-handling diffs, anything touching a high-likelihood threat-model surface, and pre-release for security-adjacent changes (quinn's matrix S row).

## Purpose

Most breaches enter through code that passed a normal review — it looked correct because the reviewer wasn't reading as an attacker. A dedicated security review reads adversarially: not "does the happy path work" but "what does the malicious path do." It's the depth complement to vuln-pipeline's breadth, focused where the threat model and dev's routing say the risk concentrates.

## Protocol

```
Risky diff arrives (dev routing / threat-model surface / self-flagged)
  -> Load context: the diff + stack-profile sinks/sources + THREAT_MODEL.md rows it touches
    -> Read adversarially by category (STRIDE lens; OWASP/CWE specifics):
       WEB: input validation · authn · authZ (per-object, not just per-route) · secrets/keys ·
       injection (SQL/command/template/LDAP) · SSRF/XXE · deserialization · crypto misuse ·
       error/info leakage · rate-limit/DoS · dependency risk introduced
       LLM/AGENT (when the diff touches agent code/prompts/tools): prompt injection (untrusted
       content into prompts undelimited) · insecure output handling (LLM output → sink unvalidated) ·
       excessive agency (tools/perms beyond role; off-plan or out-of-sandbox calls) · system-prompt
       leakage · RAG/memory poisoning + cross-tenant retrieval · unsafe auto-execution around the gate/Rail 3
      -> Each concern: exploit sketch (how an attacker reaches it) + severity + fix
        -> VERDICT: SECURE / FINDINGS (→ vuln-pipeline schema, routed) → feeds quinn's S-tier
          -> New threat discovered? → update THREAT_MODEL.md (threats outlive this diff)
```

## Boundaries & handoffs

- "Security-review this / is this diff safe" (usually from dev's routing) → **secure-code-review**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"aegis\",\"skill\":\"secure-code-review\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
