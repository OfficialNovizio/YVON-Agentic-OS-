---
name: fleet-registry
type: custom
status: built from scratch
fulfills_catalog_entry: none — added by AI & Agents redesign plan §3 (roster/lifecycle bookkeeping had no owner)
assigned_agent: meta (AI & Agents / Fleet Architect, department leader)
portable: true
date_added: 2026-07-10
---

# Fleet Registry

## Introduction
The single source of truth for WHO exists in the fleet: every agent, its department, pod, leader flag, lifecycle state, skill count, and dormancy switches. Built from scratch. The registry document lives at `assets/fleet-registry.md`, seeded 2026-07-10 with the agents built so far.

## Purpose
Without a registry, "the fleet" is a folder tree someone has to re-derive every session. The registry answers instantly: what agents exist, which are dormant and why, which slots the deployment platform must fill, and what changed when.

## When to Use
- An agent is created (post-board-approval), renamed, made dormant, or retired.
- proto promotes or archives a prototype.
- Deployment needs the roster→platform-registry mapping.
- Anyone asks "who does X?" or "does an agent for Y exist?"

## Structure / Protocol
EVENT (board-approved change | promotion | dormancy trigger) → APPEND entry → UPDATE the roster table → CROSS-CHECK against the folder tree (they must agree; disagreement = incident per Fleet Charter Rail 3).

## Instructions
1. Registry entries are **append-only**: state changes add a dated line to the agent's history, never overwrite. Retirement is a state (`retired`), not a deletion.
2. Lifecycle states: `prototype` (caged, Rail 4) → `active` | `dormant(<switch>)` | `retired`. Dormancy always names its wake condition (e.g. `dormant(mobile_active)`, `dormant(operator-scope-doc)`).
3. Every entry records: name, department, pod, role, leader?, skill counts (custom/marketplace/shared), state, wake condition if dormant, date, and the board proposal ID that authorized it.
4. Name collisions are checked HERE, at proposal time — before board sees the proposal (relay/gauge exist because this check didn't).
5. On deployment: export the roster to the platform's agent registry format (see agent-architecture-standards' platform map); dormant agents export with their switch, not omitted.
6. Reconcile registry ↔ folder tree at every audit cadence (`<FILL_IN: cadence, suggested quarterly>` — shared with relay's tool audit).

## Output Format
Registry entries as table rows (see assets/fleet-registry.md); reconciliation reports as PASS or a discrepancy list, each discrepancy tagged `registry-stale` or `unauthorized-change` (the latter is a Rail 3 incident).

## Principles
- The registry describes reality; it never authorizes it (authorization is board's, via Rail 3).
- Append-only, always — history is the point (precedent's ledger discipline, fleet edition).
- A dormant agent is a real agent: registered, auditable, wake-condition explicit.

## Fallback
If the folder tree and registry disagree and history can't resolve which is right, the folder tree wins for CONTENT, the registry wins for AUTHORIZATION — an unauthorized folder is quarantined pending an operator decision.

## Boundaries with Other Skills
- agent-architecture-standards defines what a registered agent must look like; this skill records that it exists.
- relay's mcp-tool-registry is the capability registry (tools); this is the roster registry (agents). Same discipline, different subject.
- fleet-governance routes the proposals whose verdicts this registry records.
