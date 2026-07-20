---
name: task-dispatch
type: custom
status: built from the orchestration design approved 2026-07-18/19 (dispatcher pattern; gstack router precedent)
assigned_agent: meta (AI & Agents / Fleet Governance)
portable: true — no venture names; agents/departments referenced by role
date_added: 2026-07-19
tier: 3
description: "Turns any operator request into a TASK-SPEC: discovery once, DAG of work items with owners and contracts, sharding and boundaries — the dispatcher entry for all multi-agent work"
triggers: [dispatch this, create a task spec, break this down, distribute to agents, multi-agent task, who should do this]
---

## Purpose

task-dispatch is the fleet's executive function. Any operator request that needs building, research, design, or more than one agent routes here first. The output is a TASK-SPEC — the single artifact that decides who works, in what order, inside what boundaries, against what acceptance criteria. Workers never see the whole spec (sharding rule); they receive their work item plus consumed contracts only.

## When to Use

Triggers: "dispatch this," "break this down," "create a task spec," or any do-something request touching more than one agent or department. Direct factual questions and single-skill requests bypass dispatch — route them per the session rail instead.

## Structure / Protocol

1. **Classify** — task_type, departments, lead (routing table in the session rail §2). Log the routing decision.
2. **Discovery ONCE, before any fan-out** — 3–5 concrete questions to the operator (audience, scope, constraints, references). Workers never interrogate the operator; meta does, once. BLOCKING: no work items activate until answers land in `discovery.decisions`.
3. **Decompose into work items** — each one a contract:
   - `owner` (agent), `objective` (one testable sentence)
   - `consumes` (upstream contracts) / `produces` (artifact + path) — handoffs are contracts-only, never transcripts
   - `owns_paths` (the ONLY writable paths; two agents may not share a write path in parallel)
   - `skills` (from the owner's routing), `strategy` (FAST/BALANCE budget per item, not global)
   - `blocked_by`, `acceptance` (gauge criteria), `security_review` (charter triggers — auth/data/infra work auto-adds one)
4. **Build the DAG** — read the lead department's workflow file for sequencing; parallelize only what shares no path and no dependency; name the critical path.
5. **Write the spec** to `store/tasks/TS-<seq>.yaml` using `store/tasks/TEMPLATE.yaml`. Source message verbatim, never paraphrased.
6. **Present for sign-off** (§0.1), then activate. On completion, fill the `feedback` block (outcome + lesson) — anneal consumes it.

## Boundaries with Other Skills

- agent-architecture-standards governs how agents are *built*; task-dispatch governs how they're *put to work*. 
- skill-authoring-standards owns skill format; dispatch only references skills by name.
- Department leads sequence *within* their department; meta sequences *across* departments.
- meta proposes, the operator approves — dispatch never self-activates a spec.

## Output Format

A `TS-<seq>.yaml` file per TEMPLATE.yaml, plus a short prose summary to the operator: goal, work items with owners, what runs parallel, critical path, the discovery questions (if unresolved) or locked decisions (if resolved).
