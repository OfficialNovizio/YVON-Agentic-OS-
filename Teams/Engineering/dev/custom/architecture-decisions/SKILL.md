---
name: architecture-decisions
type: custom
status: built 2026-07-08; redesigned 2026-07-09 (Fable pass — ledger index format added; numbering/status rules made explicit)
based_on_catalog_entry: vyon-architecture-decisions (VYON_Skills_Catalog_Full_v2.html, dev/Engineering) — renamed architecture-decisions, genericized per rule 0.4b off the hardcoded platform name; review routing generalized to the department's actual agents
marketplace_search: 2026-07-09 skillsmp.com — candidates found (Anthropic official architecture skill; rjmurillo adr-generator; lyndonkl adr-architecture). Kept custom for department integration (domain-reviewer routing, charter bound, precedent's append-only discipline); method cross-checked against them — 2+ options, consequences-include-downsides, sequential numbering all consistent
assigned_agent: dev (Engineering / Lead Developer)
portable: true — the ADR method is stack-agnostic; stack specifics live in the stack-profile
includes: assets/adr-template.md · assets/adr-ledger-template.md
date_added: 2026-07-08
---

## Introduction

architecture-decisions maintains the department's ADR (Architecture Decision Record) ledger: every significant technical choice is recorded with its context, the options weighed, the decision, and the consequences — append-only, superseded but never deleted. It is Engineering's institutional memory for *why the system is the way it is*, the same discipline precedent applies to governance rulings.

## Purpose

Undocumented architecture rots into folklore: nobody remembers why the queue was chosen over cron, so someone rips it out and reintroduces the bug it prevented. The ADR ledger stops that — decisions carry their reasoning forward, and reversing one requires confronting the original context.

## When to Use

Triggers: "architecture decision," "should we use [X]," "why did we choose [Y]," "record this ADR," or before any choice that is expensive to reverse (framework, datastore, auth model, a platform-level dependency like whether to adopt HelixDB for graph memory).

## Structure / Protocol

```
A significant choice arises
  -> Draft the ADR (assets/adr-template.md): context · options · decision · consequences
    -> Review with the owning agents if it touches their domain
       (data → dana · backend/API → raj · frontend → mia · mobile → nova · security → aegis · reliability → ops)
      -> Log to the ADR ledger (append-only); assign a number
        -> Reversal = a NEW ADR that supersedes the old one, citing it — never edit or delete
```

## Instructions

1. **Draft.** Context (the forces at play, honestly), the options actually considered (2+; "we only thought of one" is itself a finding), the decision, and the consequences — including the ones we don't like. No fabricated alternatives to look thorough.
2. **Review by domain.** If the decision touches another agent's domain, that agent reviews before the ADR is logged — cross-domain decisions made unilaterally are how integration breaks.
3. **Log.** Append to the ledger (`assets/adr-ledger-template.md` — one index row per ADR) with a sequential zero-padded number (ADR-001…) and date; numbers are never reused, including for rejected proposals. Status: proposed → accepted / rejected; accepted → superseded-by ADR-NNN.
4. **Supersede, never delete.** A reversed decision becomes a new ADR referencing the old; the old one's status flips to superseded-by. The history is the value.

## Output Format

The completed ADR (per template) + its ledger entry. Reversal produces a new numbered ADR.

## Principles

- **Every significant decision is recorded with its reasoning.** "We decided X because Y" is the highest-value sentence in the system.
- **Two options minimum, honestly weighed** — a decision record with one option is a rationalization.
- **Consequences include the downsides** — an ADR that only lists benefits is marketing.
- **Append-only; supersede, never delete** (precedent's discipline).
- **Cross-domain decisions get cross-domain review** before logging.
- **Charter-bound**: an ADR cannot decide to weaken a Security Charter rail — that is an operator amendment, not an architecture decision.

## Fallback

- Ledger doesn't exist yet → this skill starts it from `assets/adr-ledger-template.md` with the first ADR.
- Decision already made without an ADR → backfill one, labeled as reconstructed, so future readers at least have the reasoning as best recalled.
- Reviewer disagrees → the disagreement is recorded in the ADR's consequences; unresolved high-stakes splits escalate to the operator (dev recommends, doesn't overrule domain owners).

## Boundaries with Other Skills

- `stack-profile` (sibling) records the *current* stack; ADRs record *why* it's that stack and every change to it. A stack change is an ADR.
- `code-review-standards` enforces decisions at PR time; ADRs make them.
- Cross-department: platform-level decisions (e.g., toongine's graph-memory datastore) are ADRs reviewed with marcus/board where they carry strategic or spend weight.
