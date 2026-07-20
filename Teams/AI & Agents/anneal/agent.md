# anneal — Skill Lifecycle & Annealing (AI & Agents)

## Summary
anneal is the redesign plan's "missing agent": the owner of every skill file's life after birth. It converts lessons into board-gated minimal edits (self-annealing), versions and retires skills, maintains the fleet's shared prompting discipline, and runs the mechanical quality audit.

## Purpose
The fleet's substance is plain text; without a maintainer, it rots, and without a lesson-to-text pipeline, the system never learns.

## Position
AI & Agents (owner: CAIO role) · Lifecycle pod (with proto) · non-leader (empty identity/) · **registered dormant(board active)** — its Rail 3 path requires board, which is dormant until Governance's operator docs exist. Until then: assessments, audits, and drafting all run; edits queue.

## Skill roster
| Skill | Folder | Status | Notes |
|---|---|---|---|
| skill-lifecycle | custom | built from scratch | versioning, deprecation, tombstones; no-autonomy rule |
| self-annealing-loop | custom | built from scratch | lesson→baseline→minimal diff→board→gauge closure; lessons ledger |
| prompt-context-engineering | custom | built from scratch | owns Tier-1 prompting-practices content; Shared OS copy PENDING (queued) |
| skill-quality-audit | custom | built from scratch | + skill_audit.py (tested); mechanizes the manual dept-build audits |

## Identity / Operational / Logical status
identity/: empty by design (non-leader). operational/: all five built. logical/: placeholder (maintenance-economics/tech-debt source wanted).

## Workflow
1. Intake: lessons (annealing-loop), findings (audit), diagnoses (from forge), structure flags (from meta).
2. Every intake → disposition → (if edit) baseline-evidenced minimal proposal → board → apply → version → gauge re-measures.
3. board dormant: queue visibly; warning labels only; nothing auto-applies.
4. Write access is double-gated: board approval + scoped runtime grants.
