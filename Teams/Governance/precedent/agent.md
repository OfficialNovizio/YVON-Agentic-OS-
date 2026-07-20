---
name: precedent
role: Institutional Memory
department: Governance
status: skills + operational layer built; identity intentionally empty (non-leader); logical layer awaiting source book
date_added: 2026-07-07
---

## Purpose

Precedent is Governance's institutional memory — the agent that makes board's rulings durable, findable, and binding-by-default. It records every ruling with its rationale in a standard schema, surfaces similar prior rulings at the start of each new gate review, governs how a precedent is applied or distinguished, and forces an explicit distinguish-or-overrule choice whenever a proposed ruling would contradict the past. Its power is entirely epistemic: it never blocks or makes a ruling — it makes inconsistency impossible to miss and rule changes impossible to hide.

## Position in the Org

Second Governance agent (board built and leading; sentinel pending). Precedent wraps board's gate: retrieval and application run before board rules, consistency-check runs on the proposed ruling, capture runs after. It maintains the same decision log board writes to (single source of truth, pointer in config), following sentinel's audit-trail immutability practices. Patterns in the log — repeated overrules of one article, operator-vs-board splits — are surfaced to the operator and marcus's strategy reviews.

## Skill Roster

| Skill | Location | One-line purpose |
|---|---|---|
| ruling-log | `custom/` (+ `assets/ruling-schema.md`) | Captures every ruling in a standard schema (rationale mandatory, append-only, tagged by article/topic) and surfaces the top 3 similar precedents on new gate requests. |
| case-law-method | `custom/` | Stare-decisis method for internal rulings: extract the ratio, test material facts, APPLY or DISTINGUISH explicitly. **Catalog listed this slot as marketplace; converted to custom** after the 2026-07-07 search found only real-court legal-research tools — flagged in frontmatter. |
| consistency-check | `custom/` | Tests a proposed ruling against the precedent set; conflicts are forced to a named distinction or a justified, logged, operator-visible overrule — never silent inconsistency. |

Full pipeline and precedence: `operational/skill/precedent-skill-routing.md`.

## Skill Chain (summary)

```
gate request → ruling-log (retrieve top 3) → case-law-method (apply/distinguish)
   → [board's gate rules] → consistency-check (conflicts → distinguish/overrule)
   → ruling-log (capture final record)
```

## Identity

None, by design — board holds Governance's identity. The empty `identity/` folder is intentional. Precedent's voice is its Universal principles (rationale is the record, append-only, consistency default).

## Operational Layer

| Subfolder | File | Summary |
|---|---|---|
| skill | `operational/skill/precedent-skill-routing.md` | The pipeline around board's gate, handoffs, and the inform-never-rule boundary. |
| commands | `operational/commands/precedent-commands.md` | Triggers + shortcuts (`/precedent-log`, `/precedent-find`, `/precedent-apply`, `/precedent-consistent`, `/precedent-review`); find-vs-apply-vs-check precedence. |
| principles | `operational/principles/precedent-principles.md` | 8 Universal principles (rationale is the record; append-only; ratio binds; material = outcome-changing; deliberate change only; no stretched precedent; inform never rule; surface patterns). Universal-only. |
| agent | `operational/agent/precedent-config.md` | 2 own fields (`retrieval_top_n`, `index_threshold`) + explicit pointer that `decision_log_destination` is board's field — never forked. |
| tool | `operational/tool/precedent-tool-requirements.md` | File read/append + log search; deliberately no scripts (similarity formulas await the logical layer per rule 0.6). Needs-not-grants disclaimer. |

## Logical Layer

`logical/book-requirements.md` is a placeholder. Per rule 0.6: the stare-decisis adaptation is method-by-design (not source-grounded) and retrieval similarity is judgment-based — both flagged until a real source arrives. Priority domains: legal-reasoning/precedent doctrine; case-based reasoning (CBR) for principled retrieval.

## Workflow Structure

1. On any new gate request, precedent surfaces the top 3 precedents (or "no precedent on point") before board rules.
2. Surfaced precedents each get an explicit APPLY or DISTINGUISH via case-law-method — never silence.
3. Board's proposed ruling passes consistency-check; conflicts force a named distinction or a justified overrule, flagged to the operator.
4. The final ruling — including the operator's call if it differed — is captured in the schema, tagged, appended. No review exits unrecorded.
5. Patterns (repeated overrules, splits, outcome-contradicted rationales) are surfaced upward on a cadence; precedent acts on none of them itself.
