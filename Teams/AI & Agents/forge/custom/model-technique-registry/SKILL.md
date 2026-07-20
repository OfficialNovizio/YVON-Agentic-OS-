---
name: model-technique-registry
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-ai-stack-registry (prefix stripped; "VYON tasks" → operator golden task set; repatriated — catalog filed forge under Market Intelligence despite owner CAIO)
assigned_agent: forge (AI & Agents / AI Methods & Benchmarking)
portable: true
date_added: 2026-07-10
---

# Model & Technique Registry

## Introduction
The current inventory of models and techniques in use per agent — with measured cost/quality per task type — plus the routing recommendations derived from it. The fleet's "which model/technique for what" answer, backed by benchmarks instead of vibes.

## Purpose
Model choice quietly dominates cost and quality. Without a registry, every routing decision re-litigates from memory; with one, it cites a measured frontier.

## When to Use
- "Which model/technique for X?" — any routing question.
- A benchmark run (benchmarking-discipline) produces new results.
- A provider releases/changes a model (version event from gauge's llm-ops).

## Structure / Protocol
RECORD (model/technique, version, per-task-type cost + quality scores, date, benchmark ref) → FRONTIER (cost-quality per task type — dominated options marked) → RECOMMEND (routing rec per task type, confidence-flagged) → HAND OFF (recs are Rail 3 proposals when they change an agent's config; the operator/platform decides — model choice is operator config, never skill-forced).

## Instructions
1. Entries are dated and benchmark-referenced: an unmeasured entry says `unmeasured` — it may exist in the registry but never in a recommendation.
2. Task types come from the operator's golden task set categories (`<FILL_IN>`); until that exists, task typing is coarse (generation/analysis/tooling) and flagged reasoning-based.
3. The frontier is recomputed on every new benchmark: strictly-dominated options (worse quality AND higher cost) get marked `dominated` — kept for history, excluded from recs.
4. Recommendations always state: the frontier position, the migration cost note (config change? prompt rework? re-golden-run?), and the confidence flag per rule 0.6.
5. Model-agnosticism is preserved: skills never hardcode a model; the registry recommends, the operator's platform config binds (the current runtime-vs-plan divergence noted in PROJECT-HANDOFF §1 is exactly this split working as designed).

## Output Format
Registry table rows (append-only history like every fleet registry); frontier summaries per task type; routing recs as short memos with migration-cost and confidence lines.

## Principles
- No recommendation without a measurement behind it.
- Dominated is a fact, preference is not — the registry records facts and flags the rest.
- The operator owns the final routing decision, always.

## Fallback
No benchmarks run yet? The registry still records WHAT is in use (from meta's fleet registry version stamps) with everything marked `unmeasured` — an honest inventory precedes an informed one.

## Boundaries with Other Skills
- benchmarking-discipline produces the numbers; this skill stores and serves them.
- technique-adoption handles NEW candidates; this registry tracks incumbents + adopted.
- gauge's llm-ops watches incumbents in production; version events sync both ways.
- edge gates emerging TECH broadly; forge gates models/techniques specifically.
