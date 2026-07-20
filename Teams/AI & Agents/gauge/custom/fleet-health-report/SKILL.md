---
name: fleet-health-report
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-agent-quality-scorecard ("the CAIO governance dashboard" aspect, split into its own skill)
assigned_agent: gauge (AI & Agents / Fleet Monitor)
portable: true
date_added: 2026-07-10
---

# Fleet Health Report

## Introduction
The recurring one-page synthesis for the operator/CAIO role: fleet state, flags, open cases, dormancies, and what changed — readable in two minutes, backed by scorecard artifacts.

## Purpose
Scorecards are instruments; the operator needs an instrument PANEL. This report is the single place the human looks to know whether the fleet is fine.

## When to Use
- Reporting cadence fires (`<FILL_IN: suggested weekly, offset after the scorecard run>`).
- The operator asks "how's the fleet?" at any time (on-demand run).
- A period contains a security escalation or an unauthorized-change incident (report goes out early).

## Structure / Protocol
GATHER (latest scorecard, golden runs, open cases, registry deltas) → SYNTHESIZE (template below) → FLAG-FIRST ordering → DELIVER (operator channel) → ARCHIVE (append-only).

## Instructions
1. Fixed template, always the same order: (a) verdict line — GREEN / AMBER (open flags, none security) / RED (security case, unauthorized change, or stalled cases); (b) flags this period with routing status; (c) open cases + ages; (d) changes applied (proposal IDs) and their re-measurement status; (e) dormant roster with wake conditions; (f) data gaps (MISSING metrics, method-only areas — stated plainly).
2. Numbers come from scorecard artifacts only — the report never computes its own math (rule 0.6 lives in scorecard.py).
3. Confidence marker on the verdict line: `full-telemetry` or `manual-sample` or `behavioral-blind-spot (no golden set)` — the operator always knows how much the green is worth.
4. No advocacy: the report states, routing recommends elsewhere. If gauge believes a threshold needs changing, that's a Rail 3 proposal, not a report footnote.

## Output Format
One page, the (a)–(f) template, dated, archived append-only next to scorecards.

## Principles
- Flag-first: bad news leads, always.
- A green with blind spots says so on the verdict line.
- Same template every period — trend-reading depends on shape stability.

## Fallback
Nothing to report (no telemetry, no golden set, fleet pre-deployment)? Ship the report anyway with verdict `NOT MEASURABLE` and the (f) gaps section as the body — the operator should never mistake silence for health.

## Boundaries with Other Skills
- Pure consumer of: agent-quality-scorecard, llm-ops-basics, degradation-routing, meta's fleet-registry.
- Audience: operator/CAIO. board sees it only attached to proposals; kai (Brand Studio) owns business analytics — no overlap, different subject.
