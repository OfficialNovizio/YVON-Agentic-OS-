---
name: integration-patterns
type: custom
status: built from scratch
sources_referenced: []  # marketplace searched 2026-07-10 (skillsmp/awesomeskill/GitHub) — no verbatim single-source fit found; ETL-reliability skills in kodustech/awesome-agent-skills noted as future adoption candidates
fulfills_catalog_entry: integration-patterns (catalog listed as marketplace; built custom after search found no clean verbatim source)
assigned_agent: relay (AI & Agents / AI Integration & Tool Registry)
portable: true
date_added: 2026-07-10
---

# Integration Patterns

## Introduction
The reliability method for HOW agents call external tools: idempotency, retries, backoff, circuit breaking, contract monitoring. The catalog marked this marketplace; the 2026-07-10 search found candidates but no verbatim fit, so it's built custom (honest frontmatter above) with adoption candidates noted for scout's future passes.

## Purpose
Agents calling flaky external tools without discipline produce duplicate side-effects, retry storms, and silent contract drift. This skill is the checklist any integration must pass before relay registers it `active`.

## When to Use
- Designing or reviewing any agent↔tool integration.
- A tool moves trial → active (this review is part of the promotion).
- Repeated integration failures (gauge's error-rate signal) need diagnosis.

## Structure / Protocol
CLASSIFY (read-only vs side-effecting) → IDEMPOTENCY (keys for every side-effecting call) → RETRY (bounded, exponential backoff + jitter; retry only idempotent or keyed calls) → BREAK (circuit breaker: stop calling a failing tool, fail fast, escalate) → MONITOR (contract expectations recorded; drift alerts).

## Instructions
1. Side-effecting calls carry an idempotency key wherever the tool supports one; where it doesn't, the integration must check-before-write or be flagged `at-most-once uncertain` in the registry entry.
2. Retry budget per call chain: `<FILL_IN: suggested 3 attempts, exponential backoff with jitter — reasoning-based default>`. Never retry an unkeyed side-effecting call.
3. Circuit breaker: consecutive-failure threshold `<FILL_IN: suggested 5>` opens the circuit — subsequent calls fail fast; half-open probes on a timer. An open circuit is an incident signal to gauge, not something to silently wait out.
4. Contract monitoring: the registry entry records expected response shape; a shape change is drift → escalate to the tool's owner, don't adapt silently (silent adaptation is how poisoned responses get normalized — see aegis's detection classes on insecure output handling).
5. All of this runs INSIDE the plan-lock + sandbox rails — a retry is a planned call repeated, never a new unplanned call.

## Output Format
Integration review verdict: PASS / FAIL per checklist item; promotion recommendation to mcp-tool-registry.

## Principles
- Idempotency before retries — retries without keys are how money gets moved twice.
- Fail fast and loud beats degrade slow and silent.
- Contract drift is a security signal, not an inconvenience.

## Fallback
Tool documentation too thin to classify calls? Treat every call as side-effecting and unkeyed (most restrictive), register as trial, and route the documentation gap to scout's evaluation notes.

## Boundaries with Other Skills
- mcp-tool-registry: records the classification and review verdicts.
- gauge: consumes failure/circuit signals for the scorecard.
- Engineering raj's api-standards governs APIs we BUILD; this governs tools we CALL.
