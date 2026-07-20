# Execution Plan — [agent] / [task id] — [date]

> The Rail 1 artifact. Written by the acting agent BEFORE any external tool call; frozen and hashed by quinn (plan-lock). A mid-run tool call not derivable from this document halts the agent and escalates. Append-only once locked — a changed plan is a NEW plan citing this one.

## 1. Task
- **Requested by:** [operator / agent + reference]
- **Objective:** [one sentence — what this run produces]
- **In scope:** [systems/files/data this run may touch]
- **Out of scope:** [explicitly NOT touched — the deviation tripwires]

## 2. Planned tool calls (ordered)

| # | Tool | Purpose | Argument shape (not secrets) | Expected effect |
|---|------|---------|------------------------------|-----------------|
| 1 | <FILL_IN> | <FILL_IN> | <FILL_IN> | <FILL_IN> |

> Argument *shape*, not literal values where they contain secrets. Conditional branches are listed as numbered alternatives ("3a / 3b"), never left implicit.

## 3. Data touched
- **Reads:** [sources, per config grants]
- **Writes:** NONE agent-executed if destructive — DB create/update/delete becomes a prepared script for the operator (Rail 3). List prepared scripts here.
- **Egress:** [allowlisted destinations only — Rail 2; anything else fails closed]

## 4. Stop conditions
- [conditions under which the agent halts instead of proceeding — unexpected state, missing grant, off-plan need]
- Default: any needed call not in §2 → HALT, escalate to quinn; do not improvise.

## 5. Lock block (quinn fills)
- **Plan hash:** [hash]
- **Locked at:** [timestamp] · **Locked by:** quinn
- **Supersedes plan:** [id or none]
- **Outcome:** [completed on-plan / halted at step N — reason / superseded by plan id]
