---
name: constitution-enforcement
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-06 discussion)
based_on_catalog_entry: constitution-enforcement (VYON_Skills_Catalog_Full_v2.html, board/Governance) — the original loaded a hardcoded CONSTITUTION.toon and enforced "the 10 immutable laws"; genericized per rules 0.4/0.4b to read an operator-supplied constitution from a configured path, with no laws invented (rule 0.5)
assigned_agent: board (Governance / Governance Gate)
portable: true — the constitution's content is always per-business, supplied by the operator; this skill carries only the enforcement process and a fill-in template (assets/constitution-template.md)
includes: assets/constitution-template.md (fill-in structure for the actual laws — a template, not a constitution)
date_added: 2026-07-06
---

## Introduction

constitution-enforcement tests gated decisions against the business's own written constitution — its small set of standing, near-immutable rules — and rules PASS, VIOLATION, or UNCLEAR. The skill carries the enforcement *process* only; the laws themselves are per-business content the operator writes (a template is provided in `assets/`). No constitution exists until the operator creates one, and this skill never invents articles to fill the gap.

## Purpose

Constitutions exist so that a business's few non-negotiable rules ("we never take on debt above X," "we never sell user data," "no venture launches without a named owner") get enforced consistently instead of being re-litigated whenever they're inconvenient. This skill makes board the reliable enforcement point: every gated decision gets tested against the applicable articles, every ruling cites its article, and ambiguity is escalated rather than quietly interpreted away.

## When to Use

Triggers: "constitutional review," "is this allowed," "does this violate our rules," or automatically as the **first check** in board's gate sequence whenever a decision is submitted for governance review.

Not for: judgment calls the constitution doesn't cover (that's the rest of the gate — fiduciary-guard, risk-assessment-matrix, pre-mortem), or drafting/amending the constitution itself (operator's job; this skill can supply the template and flag ambiguities discovered in use).

## Structure / Protocol

```
Load the constitution (configured path)
  -> If none exists: STOP — offer assets/constitution-template.md; nothing to enforce
    -> Identify which articles apply to this decision
      -> Test the decision against each applicable article, quoting it
        -> Rule per article: PASS / VIOLATION / UNCLEAR
          -> Aggregate ruling; log to the configured decision log
```

## Instructions

### Phase 1 — Load

Read the constitution from the path in board's config (`operational/agent/board-config.md`, `constitution_path`). If the path is unset or the file doesn't exist, stop immediately: report that no constitution exists, offer `assets/constitution-template.md` as the starting structure, and do not proceed — enforcing rules that were never written is fabrication.

### Phase 2 — Scope

List which articles plausibly apply to the decision under review, and state why each applies (or why the rest don't). This scoping is shown in the output — an article silently skipped is an enforcement hole.

### Phase 3 — Test

For each applicable article: quote the article verbatim, apply its operational test (each article in the template carries one), and state the finding with the specific facts of the decision that drive it. Findings per article:

- **PASS** — the decision does not conflict with this article.
- **VIOLATION** — the decision conflicts. Cite the article number and the exact conflicting element of the decision.
- **UNCLEAR** — the article's language doesn't clearly cover this case. Do not resolve the ambiguity unilaterally; escalate it (Phase 5).

### Phase 4 — Aggregate Ruling

- Any **VIOLATION** → overall ruling is VIOLATION. **Non-negotiable:** a constitutional violation cannot be conditionally approved, mitigated around, or waived by board. The only paths forward are (a) change the decision, or (b) the operator amends the constitution through its own amendment rule — which board notes but does not perform.
- No violations, any **UNCLEAR** → overall ruling is UNCLEAR, escalated.
- All PASS → overall PASS; the decision proceeds to the rest of the gate sequence (fiduciary-guard, risk-assessment-matrix, pre-mortem as applicable).

### Phase 5 — Escalate Ambiguity

Every UNCLEAR goes to the operator with: the article quoted, the decision element it may or may not cover, and the two readings in tension. The operator's resolution should ideally become an amendment or clarification note in the constitution itself, so the same ambiguity isn't escalated twice.

### Phase 6 — Log

Record the ruling — decision, articles tested, findings, overall ruling, date — to the configured decision log (`decision_log_destination` in board's config; the operator directly until it's set). Rulings form precedent-like history; the Governance department's precedent agent (Institutional Memory, when built) is the eventual consumer.

## Output Format

```
## Constitutional Review: [decision, one line]

**Constitution:** [file/version/date loaded]

### Applicable Articles
[Article # + why it applies; articles excluded + why not]

### Findings
| Article | Quoted rule | Finding | Basis |
|---|---|---|---|

### Ruling: PASS / VIOLATION / UNCLEAR
[If VIOLATION: the citing article(s), the conflicting element, and the two paths
 (change the decision / operator amends the constitution). If UNCLEAR: the
 escalation per Phase 5.]

### Logged
[Where the ruling was recorded]
```

## Principles

- **No constitution, no enforcement.** Never invent, assume, or "reasonably infer" an article. An empty constitution means this skill reports exactly that and stops.
- **Violations are not negotiable at the gate.** Board can't waive the constitution; only the operator's amendment process can change it. Anything waivable belongs in config thresholds (fiduciary-guard), not the constitution.
- **Quote, don't paraphrase.** Every finding cites the article's actual text — paraphrase is where interpretation drift starts.
- **Escalate ambiguity, don't absorb it.** An UNCLEAR resolved silently by board today becomes an inconsistent precedent tomorrow.
- **Every ruling is logged.** An unlogged ruling didn't happen, and can't serve as precedent.

## Fallback

- Config path unset / file missing → stop per Phase 1, offer the template.
- Constitution exists but has no operational tests (bare statements only) → still enforce, flagging each finding as interpretation of untested language, and recommend the operator add tests per the template's structure.
- Decision text too vague to test → ask for the specific decision element(s) rather than ruling on a summary.
- Decision log destination unset → deliver the ruling log to the operator directly and say so.

## Boundaries with Other board Skills

- Runs **first** in the gate sequence. A VIOLATION ends the review early — fiduciary-guard, risk-assessment-matrix, and pre-mortem don't run on an unconstitutional decision.
- fiduciary-guard owns *threshold* rules (spend, runway, ROI — tunable per business, waivable per config); this skill owns *categorical* rules (never-do's). If a rule keeps needing exceptions, it belongs in fiduciary-guard's config, not the constitution — flag that pattern when seen.
- strategic-veto tests decisions against *locked strategy commitments* (which change quarterly-to-yearly); this skill tests against the *constitution* (which should rarely change). Same shape, different document, different mutability.
- Boundary with marcus: decision-critic improves a proposal before it's submitted; this skill is part of the gate that rules on it after.
