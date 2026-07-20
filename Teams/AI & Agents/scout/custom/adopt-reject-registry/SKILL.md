---
name: adopt-reject-registry
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-tool-evaluation protocol step 3 ("adopt/reject; registry entry either way"), expanded to its own skill
assigned_agent: scout (AI & Agents / Tool & Ecosystem Scanner)
portable: true
date_added: 2026-07-10
---

# Adopt/Reject Registry

## Introduction
The institutional memory of every evaluation verdict — adopts, rejects, watches, expiries — with reasons. The fleet never unknowingly re-evaluates the same candidate from scratch.

## Purpose
Rejection reasons evaporate unless recorded; six months later the same tool gets re-trialed on the same flaws. This registry is the "we already know" layer.

## When to Use
- Any intake verdict lands (adopt/reject/watch/expired-untested).
- A scan surfaces a repeat candidate (checked here FIRST).
- A watch re-check date arrives.

## Structure / Protocol
RECORD (candidate, version evaluated, verdict, dated reasons, evidence refs, re-check date if watch) → CHECK (every scan cross-references before shortlisting) → RE-OPEN (only with new information: new version, changed maintenance status, changed fleet gap — the delta is stated) → SYNC (adopts mirror to relay's tool registry; this registry keeps the WHY, relay's keeps the WHAT).

## Instructions
1. Append-only, like every fleet registry — verdicts are dated history, never overwritten.
2. Reasons are specific enough to re-test: "failed criteria 2 and 4 (list attached)" not "wasn't good".
3. Version-scoped: a rejection binds the version evaluated; a new major version is a legitimate re-open delta.
4. Watch entries without re-check dates are violations (the lint mindset applies — relay's registry_lint pattern can extend here `<FILL_IN: if operator wants mechanical checks, propose via Rail 3>`).
5. Quarterly reconcile with relay's registry: every active tool traces to an adopt entry here; orphans are incidents (a tool nobody evaluated is in the fleet).

## Output Format
Registry rows (candidate/version/verdict/reasons/evidence/re-check); reconcile reports (traced / orphaned).

## Principles
- Either way, recorded — a reject is worth as much as an adopt.
- Re-opening requires a stated delta; nostalgia is not new information.
- The WHY lives here, the WHAT lives with relay — never fork the WHAT.

## Fallback
Historical evaluations that predate this registry (Engineering's §5 tool choices)? Backfill entries marked `retroactive — evidence in dept plans`, so reconciliation has ground truth without pretending contemporaneous rigor.

## Boundaries with Other Skills
- tool-evaluation-intake writes verdicts; ecosystem-scanning reads before shortlisting.
- relay's mcp-tool-registry: the operational mirror of adopts.
- precedent (Governance) archives evaluation documents; this registry indexes verdicts.
