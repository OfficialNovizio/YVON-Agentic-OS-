---
name: consistency-check
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 build)
based_on_catalog_entry: vyon-consistency-check (VYON_Skills_Catalog_Full_v2.html, precedent/Governance) — renamed consistency-check, genericized off "vyon-" prefix; overrule logging goes to the shared decision log, not a hardcoded MEMORY.md
assigned_agent: precedent (Governance / Institutional Memory)
portable: true — operates on the business's own ruling log; no company specifics
date_added: 2026-07-07
---

## Introduction

consistency-check is the contradiction detector: before a proposed board ruling is finalized, it tests the proposal against the precedent set, and when they conflict it forces an explicit choice — **distinguish** (the cases differ materially, both rulings stand) or **overrule** (the old rule was wrong or is now wrong; the new ruling replaces it, with justification logged). What it never allows is the third option every organization defaults to: ruling inconsistently and not noticing.

## Purpose

Inconsistent rulings are how governance loses authority — if the same facts got APPROVE in March and REJECT in July with no stated reason, both rulings become arguments rather than precedents, and every future proposer relitigates. This skill makes consistency the default and *deliberate change* the only alternative: precedent can absolutely be overruled, but overruling is a visible, justified act, never drift.

## When to Use

Triggers: "consistent with past," "precedent conflict," "have we ruled differently before," or automatically when board has a *proposed* ruling in hand and ruling-log has surfaced similar precedents.

## Structure / Protocol

```
Take the proposed ruling + the surfaced precedent set
  -> For each precedent: would its ratio, applied to this case, produce the same ruling?
    -> Same → consistent, note and proceed
    -> Different → CONFLICT: present both to board
        -> DISTINGUISH (name the material difference — cases differ, both stand)
        -> or OVERRULE (new rule replaces old — justification mandatory, logged)
          -> Never silent: the conflict and its resolution go in the ruling record
```

## Instructions

### Phase 1 — Frame the Comparison

For each surfaced precedent, use `case-law-method`'s extraction (ratio + material facts) and ask one question: *if that ratio were applied to this case, would it produce the proposed ruling?* Yes → consistent. No → conflict.

### Phase 2 — Present Conflicts, Both Sides

For each conflict, present to board: the prior ruling (ID, case, ratio, rationale) and the proposed ruling side by side, with the specific point of contradiction stated in one sentence. No recommendation smuggled in — the point is to make the choice unavoidable, not to make it.

### Phase 3 — Force the Choice

- **DISTINGUISH** — board names a material factual difference (per case-law-method's materiality bar: it would have changed the prior outcome). Both rulings stand; the distinction is recorded in the new ruling's record so the two cases stop looking contradictory to future readers.
- **OVERRULE** — the cases genuinely match and board (with the operator, for anything the operator originally decided) rules differently anyway. Mandatory justification: *what changed* — new information, changed circumstances, or the honest admission that the prior ratio was wrong. The overruled ruling stays in the log (append-only), marked as overruled-by with the new ruling's ID; the new ruling records what it overruled and why.

A proposed ruling that can neither distinguish nor justify an overrule should follow precedent — that's the discipline working as intended.

### Phase 4 — Log

The conflict, the choice, and the justification all go into the ruling record (ruling-log schema). Overrules additionally get flagged in the output so the operator sees the rule change explicitly — a changed rule is a governance event, not a footnote.

## Output Format

```
## Consistency Check: [proposed ruling, one line]

**Precedents compared:** [N; IDs]

### Consistent
[IDs where the prior ratio produces the same result]

### Conflicts
| Prior ruling | Its ratio | Proposed ruling | Point of contradiction |
|---|---|---|---|

### Resolution (per conflict): DISTINGUISH / OVERRULE
[Distinguish: the named material difference.
 Overrule: what changed + justification; prior ruling marked overruled-by.]

### Logged
[Record IDs updated; overrules flagged to the operator]
```

## Principles

- **Consistency is the default; change is deliberate.** Precedent bends through named distinctions or justified overrules — never through drift.
- **Overrules are never silent.** Mandatory justification, both records cross-marked, operator notified.
- **The overruled ruling stays.** Append-only history: future readers see the rule, the change, and the reason — the log's whole value.
- **No manufactured distinctions.** Escaping inconvenient precedent via immaterial differences is drift wearing a costume; the materiality bar is case-law-method's (would it have changed the prior outcome?).
- **Present, don't decide.** This skill makes the conflict unavoidable; board and the operator make the call.

## Fallback

- No precedents on point → nothing to check; note that the proposed ruling sets fresh precedent.
- Precedents conflict *with each other* (latent inconsistency already in the log) → surface it as its own finding; board resolves which line survives, via the same distinguish-or-overrule protocol applied retrospectively.
- The prior ruling was an operator overrule of board → the operator's rule is the precedent, not board's original recommendation; conflicts with it escalate to the operator directly.

## Boundaries with Other precedent Skills

- `ruling-log` supplies the precedent set; `case-law-method` supplies the ratio/materiality machinery; this skill owns the conflict protocol. In sequence on a live review: log surfaces → method extracts → this skill tests the *proposed* ruling.
- Boundary with board: runs as the last step before board finalizes any ruling that has precedents on point. Board can overrule precedent; it cannot skip the justification.
