---
name: degradation-routing
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-agent-quality-scorecard protocol step 3 ("degradation → forge"), expanded — the catalog's pointer to forge finally has both ends
assigned_agent: gauge (AI & Agents / Fleet Monitor)
portable: true
date_added: 2026-07-10
---

# Degradation Routing

## Introduction
What happens after a flag: classify the signal, package the evidence, route it to the right fixer, track it to closure. The catalog had detection pointing at an absent agent; this skill is the repaired connection.

## Purpose
A flag that doesn't reach a fixer with its evidence intact is noise. This skill guarantees every flag ends in exactly one of: diagnosed-and-fixed, diagnosed-and-accepted, or explicitly-parked (with a re-check date).

## When to Use
- Any scorecard or golden-run flag fires.
- An open degradation case needs status or has stalled.
- A fix was applied and the re-measurement result is in.

## Structure / Protocol
CLASSIFY → PACKAGE (evidence bundle) → ROUTE → TRACK (open case registry) → CLOSE (re-measurement verdict).

## Instructions
1. Classify the flag:
   - **Operational** (cost, latency, escalations up; behavior fine) → forge (technique/model diagnosis) with infra angle noted for ops (Engineering) if platform-side.
   - **Behavioral** (golden-set drift, success down) → forge (degradation-diagnosis).
   - **Structural** (audit failures, skill drift — from anneal's audits) → anneal directly.
   - **Security-smelling** (output shapes matching aegis's detection classes, egress anomalies) → quinn + aegis IMMEDIATELY, outside the normal loop.
2. Evidence bundle: the flag line, raw metrics/run artifacts, version stamps, last relevant change (proposal ID), trailing baseline. No bundle, no routing — a bare flag is not actionable.
3. One case per degradation, in the open-case list with: id, agent, class, routed-to, opened, status, re-check date. Cases stall visible: anything past `<FILL_IN: suggested 2 periods>` without movement escalates to meta.
4. Closure requires gauge's re-measurement showing the metric back inside threshold — the fixer saying "fixed" is necessary but not sufficient.
5. Accepted degradations (forge diagnoses "this is the new normal, cost of a deliberate trade") require the originating proposal ID and become new baselines — recorded, never silent.

## Output Format
Routing record per case: classification, evidence bundle ref, destination, timestamps, closure verdict. Open-case list maintained append-style.

## Principles
- Every flag ends somewhere on purpose — fixed, accepted, or parked-with-a-date.
- Evidence travels with the flag; fixers never re-derive what gauge already measured.
- Security smells skip the queue.

## Fallback
Classification ambiguous? Route to forge as primary with the alternates cc'd in the bundle — forge's diagnosis step re-routes if needed. Never park a flag because classification is hard.

## Boundaries with Other Skills
- Consumes: agent-quality-scorecard + llm-ops-basics flags; anneal's audit findings.
- Routes to: forge (diagnosis), anneal (skill fixes), quinn/aegis (security), ops (infra).
- fleet-health-report summarizes open cases; meta receives stall escalations.
