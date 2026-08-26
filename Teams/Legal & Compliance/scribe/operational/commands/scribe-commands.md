# scribe · commands

> Trigger table mapping natural-language operator phrases to which scribe skill fires. Slash-style shortcuts are an optional convenience layer. Precedence for ambiguous phrasing is authoritative in `operational/skill/scribe-skill-routing.md`; this file mirrors it for quick lookup.

---

## Natural-language triggers → skill

| Phrase pattern | Fires | Notes |
|---|---|---|
| "review this contract" · "review this agreement" · "review this vendor MSA" · "review this SaaS agreement" · "is this contract okay" · "check this SaaS agreement" · "redline this contract" · "flag anything in this contract" · "review the vendor terms" | `contract-review-routing` | Entry point for review |
| "register this template" · "add this template" · "publish a new template" · "version bump this template" · "retire this template" | `contract-library` | Template CRUD |
| "what templates do we have" · "show me the contract library" · "find the MSA template" · "find the NDA template" · "list templates" | `contract-library` | Retrieval |
| "extract obligations from this contract" · "add this signed contract to the ledger" · "track this contract" · "what am I on the hook for" · "what obligations are we tracking" · "show me the obligation ledger" · "what renewals are coming up" · "notice window on this vendor" · "upcoming contract obligations" | `obligation-extraction` | Post-signing ledger |

---

## Ambiguous phrasings → ASK, don't guess

| Phrase | Why ambiguous | What to ask |
|---|---|---|
| "add this contract" | Template register OR signed-to-ledger | "Register a template or add a signed contract to the ledger?" |
| "this contract" (no verb) | State unclear | "Reviewing, registering as a template, or already signed?" |
| Multiple contracts in scope, no slug | Skill refuses to guess a match | Ask for slug or counterparty first |

Silent picks on ambiguity are a defect (playbook §0.5). Ask.

---

## Slash-style shortcuts (optional convenience layer)

| Shortcut | Fires | Same as |
|---|---|---|
| `/scribe:review` | `contract-review-routing` | "review this contract" |
| `/scribe:template list` | `contract-library` retrieve-list | "list templates" |
| `/scribe:template register` | `contract-library` Step 1 | "register this template" |
| `/scribe:template retire` | `contract-library` Step 6 | "retire this template" |
| `/scribe:ledger extract` | `obligation-extraction` Steps 1–4 | "extract obligations from this contract" |
| `/scribe:ledger list` | `obligation-extraction` Step 5 | "what obligations are we tracking" |
| `/scribe:ledger upcoming` | `obligation-extraction` Step 5 (by upcoming date) | "what renewals are coming up" |

Shortcuts are convenience only. Natural-language triggers above are authoritative.

---

## Precedence for cross-skill overlap

Authoritative in `operational/skill/scribe-skill-routing.md` under "Precedence rules" and mirrored in the `# yvon-compile:` block. Ambiguous → ASK.
