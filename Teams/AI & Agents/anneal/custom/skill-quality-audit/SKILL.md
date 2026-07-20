---
name: skill-quality-audit
type: custom
status: built from scratch
fulfills_catalog_entry: none — mechanizes the manual audits run at every department build (hardcode leaks, folder shape, frontmatter)
assigned_agent: anneal (AI & Agents / Skill Lifecycle & Annealing)
portable: true
date_added: 2026-07-10
---

# Skill Quality Audit

## Introduction
The recurring mechanical sweep of every skill file in the fleet: hardcoded venture/stack names, missing/malformed frontmatter, stale dated assets, structural violations. What was done by hand at each department build, made a standing job. Mechanical checks run in `scripts/skill_audit.py`.

## Purpose
Drift is cumulative and invisible until audited. A fleet whose substance is plain text needs a linter with a schedule.

## When to Use
- Audit cadence fires (`<FILL_IN: suggested quarterly, aligned with relay/meta audits>`).
- A department build or big change lands (post-change sweep).
- Spot-check before any deployment wave.

## Structure / Protocol
SWEEP (`python scripts/skill_audit.py <root> [--forbidden words.txt]`) → TRIAGE (each finding: violation class + owning agent) → JUDGE (mechanical findings are candidates, not verdicts — read each in context; provenance frontmatter legitimately contains venture names) → ROUTE (fix proposals via skill-lifecycle; structural issues to meta; false positives recorded so the next audit is smarter) → REPORT (dated audit report, append-only).

## Instructions
1. Mechanical checks (the script): forbidden-word scan OUTSIDE provenance frontmatter (venture/product names from the operator-supplied list `<FILL_IN: forbidden-words list per business>` + the standing defaults); required frontmatter fields present (name/type/status/assigned_agent/portable/date_added); dated assets older than `<FILL_IN: suggested 12 months>` flagged stale; `portable: false` without a reason flagged.
2. Judgment checks (anneal reads, script can't): description quality (SDO rules), boundary sections that name real skills, instructions that reference dead paths.
3. Every finding gets exactly one disposition: fix-proposed / false-positive (logged) / accepted-risk (operator sign-off required).
4. The audit NEVER fixes in place — findings become Rail 3 proposals like everything else.
5. Audit the auditors too: this skill's own files and meta's are in scope; nobody self-exempts.

## Output Format
Dated audit report: findings table (file, line, class, disposition, route), summary counts, comparison to last audit (drift direction).

## Principles
- Mechanical findings are candidates; dispositions are judgment — both get recorded.
- A finding without a disposition is an audit that didn't finish.
- The audit's value is the trend line: same checks, same shape, every time.

## Fallback
Forbidden-words list not supplied yet? Run with the standing defaults (names found in source-catalog provenance) and flag the config gap in the report header — a partial audit that says so beats none.

## Boundaries with Other Skills
- Findings needing edits → skill-lifecycle (proposals). Structural shape issues → meta's agent-architecture-standards. Registry mismatches → meta's fleet-registry reconcile.
- gauge's degradation-routing sends structural flags here; audit findings can open cases there (drift ↔ degradation cross-check).
