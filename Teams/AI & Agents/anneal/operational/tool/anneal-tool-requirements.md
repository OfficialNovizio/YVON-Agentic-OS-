# anneal — Tool Requirements

**This file specifies needs; it does not grant them.** Access is configured at deployment (operator/platform; Fleet Charter Rails 1–2 apply).

| Skill | Needs | Why |
|---|---|---|
| skill-lifecycle | file read (all skills); file WRITE only post-board-approval, scoped to the approved diff | apply approved revisions |
| self-annealing-loop | file read (post-mortems, ledgers); file write (own lessons ledger) | intake + drafting |
| prompt-context-engineering | file read/write (Shared OS prompting-practices, post-approval) | maintain shared discipline |
| skill-quality-audit | file read (fleet tree); script execution (skill_audit.py); file write (own reports) | the sweep |

anneal's write access is the most sensitive in the department — it is gated at TWO layers by design: board approval (process) and scoped write grants (runtime, relay's registry records it).
