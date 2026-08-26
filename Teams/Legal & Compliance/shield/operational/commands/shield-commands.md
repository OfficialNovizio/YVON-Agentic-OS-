# shield · commands

> Trigger table. Precedence in `operational/skill/shield-skill-routing.md`.

## Natural-language triggers → skill

| Phrase pattern | Fires | Notes |
|---|---|---|
| "log this dispute" · "register this demand letter" · "we got a demand letter" · "regulatory action against us" · "legal threat" · "dispute status" | `dispute-log` (log / update) | State mutation or status query |
| "list our disputes" · "open disputes" · "what disputes do we have" · "dispute exposure summary" · "aggregate exposure" · "portfolio exposure" | `dispute-log` (retrieve / exposure) | State query / aggregate |
| "upcoming response deadlines" · "what's overdue" | `dispute-log` (calendar / Step 6) | Deadline view |
| "close dispute" · "settled" · "dismissed" | `dispute-log` (close) | Closure with disposition |
| "case assessment" · "draft a case assessment memo" · "assess this dispute" · "assess this claim" · "early case assessment" · "claim assessment" · "damages exposure analysis" · "defense analysis" · "how bad is this dispute" · "what's our exposure" (single dispute) | `case-assessment-memo` | Analytical memo per dispute |

## Ambiguous phrasings → ASK, don't guess

| Phrase | Why ambiguous | What to ask |
|---|---|---|
| "we got sued" | Log first, then assess? Or already handling and looking for update? | "Should I log this as a new dispute, or is it already in the register and you want a status update / case assessment?" |
| "dispute update" | Update the row OR request analytical update? | "Register update (status change) or case-assessment re-run?" |
| "what's our exposure" | Single dispute (case-assessment) OR portfolio (dispute-log Step 7)? | "This dispute specifically, or the aggregate across all active disputes?" |

Silent picks are defects (§0.5).

## Slash-style shortcuts

| Shortcut | Fires | Same as |
|---|---|---|
| `/shield:log` | `dispute-log` (Step 1) | "log this dispute" |
| `/shield:list` | `dispute-log` retrieve | "list our disputes" |
| `/shield:calendar` | `dispute-log` Step 6 | "upcoming response deadlines" |
| `/shield:exposure` | `dispute-log` Step 7 | "portfolio exposure" |
| `/shield:assess` | `case-assessment-memo` | "case assessment" |
| `/shield:close` | `dispute-log` Step 3 | "close dispute" |

## Precedence for cross-skill overlap

Authoritative in `operational/skill/shield-skill-routing.md`. Ambiguous → ASK.
