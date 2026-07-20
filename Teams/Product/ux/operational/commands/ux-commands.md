# ux — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "do we know", "have we researched", "find the study", "is this known", "cite research" | research-repository | /repo |
| "run a study", "interview users", "usability test", "survey", "design the research" | study-design | /study |
| "what does the data say", "synthesize", "findings", "how confident", "the takeaway" | synthesis-discipline | /synth |
| "what are customers saying", "support themes", "reviews", "NPS verbatims" | voice-of-customer-intake | /voc |

## Precedence
1. Any new-study request routes to research-repository FIRST (query before you run); /study on an un-queried question bounces to /repo.
2. A claim entering a PRD must pass synthesis-discipline's confidence flag — unflagged claims bounce.
3. Voice-of-customer patterns are directional evidence, not verdicts — strong ones become /study GAPs, never product decisions.
