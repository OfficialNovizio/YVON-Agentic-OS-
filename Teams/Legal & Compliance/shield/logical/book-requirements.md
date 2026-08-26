---
agent: shield
department: Legal & Compliance
type: logical-book-requirements
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# shield · logical / book-requirements

> **Touch 1 placeholder** (§8.1). Path 1 all-free build; §8.8a 3-attempt hunt applied dept-wide via scribe.

## Proposed scripts for touch-2 (§8.0)

| # | Proposed script | Route | Source book #1 (★) | Source book #2 | Notes |
|---|---|---|---|---|---|
| 1 | `dispute_exposure_range_computer` | A/C | Restatement (Second) of Contracts + Restatement (Third) of Restitution — [Internet Archive](https://archive.org/details/restatementoflaw0012unse) (controlled digital lending) | Federal Rules of Civil Procedure — [uscourts.gov](https://www.uscourts.gov/rules-policies/current-rules-practice-procedure/federal-rules-civil-procedure) (free official) | Grounds `case-assessment-memo` damages-range computation; deterministic aggregation of low/mid/high from documented sub-claims. Route A math + Route C aggregation over judgment inputs. |
| 2 | `frcp_rule_12` **✅ EXTRACTED touch-2 2026-07-29** — `Shared OS/logical/frcp_rule_12.py` (Route A/B — 11 verbatim deadlines from FRCP Rule 12(a)-(f), day-counting per Rule 6, Rule 12(b) defence catalog, Rule 12(h) waiver classifier) | A | Federal Rules of Civil Procedure Rule 12 (2024) — [Cornell LII free](https://www.law.cornell.edu/rules/frcp/rule_12) | FRCP Rule 6 (Computing and Extending Time) — [Cornell LII free](https://www.law.cornell.edu/rules/frcp/rule_6) |
| 2b | `state_court_deadlines` (per-state, pending) | A | State-court rule sets (CCP for CA, CPLR for NY, etc.) | ABA Model Rules of Professional Conduct — [ABA free-access](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/) | Federal-only in script #2; state-court variants added on operator demand |
| 3 | `always_L3_dispute_classifier` | B | Restatement (Second) of Torts — [Internet Archive](https://archive.org/) (CDL) | Case-law digest for class-actions / injunctive-relief standards (public Fed. Cir. + Circuit cases) — free | Grounds `shield-config.md` always-L3 list operationally — deterministic Route B classifier: given dispute intake fields, returns L1/L2/L3 recommendation. Backed by named case-law examples. |
| 4 | `settlement-negotiation-framework` (Route D `.md` per §8.9) | D | *Negotiation Journal* (Harvard PON / MIT Press) — [PON](https://www.pon.harvard.edu/daily/teaching-negotiation-daily/negotiation-journal-now-open-access/) | Corbin on Contracts (Vol. on Remedies) — Internet Archive CDL | Qualitative framework for settlement discussions. §8.9 practitioner wisdom — extract BATNA / ZOPA / concession-strategy models from *Negotiation Journal* (40 years open access) + Corbin's damages doctrine. |

**Tier assessment:** all 4 Tier A candidates.

**Source authentication (§8.8):** ALI (Restatements), Federal Judiciary + AO (FRCP), ABA (Model Rules), MIT Press / Harvard PON (Negotiation Journal), Corbin (Yale, historical). All institutional or academic; no unattributed.

**Whole-book access (§8.10):** FRCP + ABA Model Rules are direct-web / official-PDF. Restatements + Corbin are Internet Archive CDL (whole book, queued borrow). PON journal is fully open access. No summary substitution.

## Inherited scripts

None yet. `dispute_exposure_range_computer` (#1) and `response_deadline_calendar_computer` (#2) are likely candidates for cross-agent reuse — `Finance & Treasury` (once built) will consume exposure aggregates for reserving; `comply` may consume deadline computation for regulatory response deadlines. When those consumers materialise, migrate per §13.5 promotion rule.

## Skills → proposed script mapping

| Skill | Imports from Shared OS/logical/ (touch-2) | Rationale |
|---|---|---|
| `case-assessment-memo` (marketplace) | `dispute_exposure_range_computer` (#1) · `settlement-negotiation-framework.md` (#4) | Damages range + settlement framing |
| `dispute-log` | `response_deadline_calendar_computer` (#2) · `always_L3_dispute_classifier` (#3) | Calendar arithmetic + escalation classification |

## Flag clearance (0.6)

| Judgment | Skill | Current | Cleared by |
|---|---|---|---|
| Damages range low/mid/high derivation | `case-assessment-memo` | reasoning-based (framework Tier B via source citations in skill body) | script #1 |
| Deadline arithmetic per venue rule set | `dispute-log` | arithmetic deterministic; **rule set is reasoning-based** until sourced from FRCP + state rules | script #2 |
| Always-L3 classification for a specific dispute intake | `dispute-log` | reasoning-based (config lists categories; classification of specific facts is judgment) | script #3 |
| Settlement recommendation direction | `case-assessment-memo` | reasoning-based | `.md` #4 (Route D — qualitative) |
| Insurance-notification triggering | `dispute-log` | Tier B (policy language is the source, per `shield-config.md`) — no script needed if config is real | remains Tier B |

## Inherited scripts (Shared OS/logical/)

| Script | Source | Purpose |
|---|---|---|
| `frcp_rule_12.py` **✅ EXTRACTED touch-2 2026-07-29** | [FRCP Rule 12 (Cornell LII)](https://www.law.cornell.edu/rules/frcp/rule_12) — public domain | Defensive-pleading deadline table + waiver rules for the 21-day answer window and Rule 12(b) motions. |
| `frcp_rule_26.py` **✅ EXTRACTED touch-2 2026-08-10** | [FRCP Rule 26 (Cornell LII)](https://www.law.cornell.edu/rules/frcp/rule_26) — public domain | Discovery calendar (7 verbatim deadlines: initial-disclosures 14d, expert 90d before trial, pretrial 30d before trial, Rule 26(f) 21d before scheduling), 6 proportionality factors, expert-report 6-item completeness checker. |

## Still pending

- **Touch-2 extraction** for all 4 artefacts.
- **State-court rule sets** for deadline computation — FRCP covers federal; state rules (CCP for CA, CPLR for NY, etc.) need per-state extraction if operator declares those jurisdictions. Defer to per-jurisdiction demand.
- **Non-US dispute frameworks** — UK CPR, EU rules of court, arbitration institutional rules (ICC, LCIA, SIAC, AAA). Path 1 doesn't cover these. Add as operator declares jurisdictions.
- **Getting to Yes / Never Split the Difference** (paywalled) — Route D practitioner sources for settlement framework. Complement to *Negotiation Journal* if operator drops in `Agents/_books/`.
