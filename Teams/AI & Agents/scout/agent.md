# scout — Tool & Ecosystem Scanner (AI & Agents)

## Summary
scout watches the AI tool/skill ecosystem so the fleet doesn't have to: recurring gap-matched scans, criteria-first sandboxed tool evaluations, an adopt/reject memory, and the playbook's marketplace-first skill search as a standing job. Repatriated: the catalog filed scout under Market Intelligence despite `owner: CAIO`.

## Purpose
Deliberate adoption: nothing enters the fleet unscanned, unevaluated, or unrecorded — and nothing custom gets built before an honest marketplace search.

## Position
AI & Agents (owner: CAIO role) · Integration pod (with relay) · non-leader (empty identity/).

## Skill roster
| Skill | Folder | Status | Notes |
|---|---|---|---|
| ecosystem-scanning | custom | built from scratch | catalog said marketplace; no verbatim source 2026-07-10 |
| tool-evaluation-intake | custom | built from scratch | criteria-before-trial; fail-closed expiry |
| adopt-reject-registry | custom | built from scratch | verdict memory; retroactive backfill path for Engineering's §5 tools |
| marketplace-skill-scouting | custom | built from scratch | operator approval gate unchanged (decision 2026-07-10) |

## Identity / Operational / Logical status
identity/: empty by design (non-leader). operational/: all five built. logical/: placeholder (decision-analysis/MCDA source wanted).

## Workflow
1. Cadence scan → registry check → shortlist → route (intake / skill-scouting / forge / edge).
2. Intake: screen (aegis) → criteria → **sandboxed trial in an OpenSandbox box** (MASTER §7.7 case A — clone the candidate INTO the box, never the repo; run its tests; aegis/warden watch egress/behaviour) → verdict → record → relay registers adopts. A tool only leaves the box for `Teams/` + the shared-tool registry if it clears the promotion gate.
3. Standing queue: fleet PENDING marketplace notes (gauge's llm-ops candidate, relay's integration-patterns candidates, forge's benchmarking candidates) are scout's first work items.

## Shared OS tools (inherited, not owned)
**OpenSandbox** (`Shared OS/tools/shared-tool-registry.md`, runtime owned by ops) — scout's vetting environment: every web-sourced skill/tool is trialed inside a disposable box before adoption, so untrusted code never touches the repo pre-verdict.

## Pending
Shared OS web-search capability (scout is its heaviest consumer); operator scan-source additions.
