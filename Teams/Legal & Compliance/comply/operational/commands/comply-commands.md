# comply · commands

> Trigger table mapping natural-language phrases to which comply skill fires. Precedence for ambiguous phrasing is authoritative in `operational/skill/comply-skill-routing.md`; this file mirrors it for quick lookup.

---

## Natural-language triggers → skill

| Phrase pattern | Fires | Notes |
|---|---|---|
| "check the feeds" · "what's new" · "regulatory update" · "reg update" · "watch the regulators" · "anything new from the regulators" · "regulatory feed check" · "has anything moved" | `reg-monitor-routing` | Feed monitor entry |
| "are we compliant" · "compliance check" · "compliance status" | `obligation-register` (retrieve) | State query |
| "add this obligation" · "register this obligation" · "update this obligation" · "retire this obligation" | `obligation-register` (mutate) | Register CRUD |
| "what obligations apply to venture X" · "what obligations apply in jurisdiction Y" · "obligations by owner Z" · "upcoming attestations" | `obligation-register` (retrieve) | Retrieval by dimension |
| "quarterly obligation review" · "obligation attestation" · "what's overdue" | `obligation-register` (Step 5 review) | Cadence review |
| "is this feature regulated" · "do we need a licence" · "does this trigger a regime" · "regulated activity check" · "launch gate" · "can we ship this" · "readiness check for [activity]" · "pre-launch compliance review" · "does this feature need registration" | `regulated-activity-readiness` | Pre-launch gate |

---

## Ambiguous phrasings → ASK, don't guess

| Phrase | Why ambiguous | What to ask |
|---|---|---|
| "compliance" (bare noun, no verb) | State query, mutation, or launch gate? | "Are you asking about existing obligations, adding a new one, or checking a proposed activity?" |
| "does this apply to us" | Register lookup OR readiness check | "Is this a regulation we're already tracking, or a proposed activity?" |
| "compliance for jurisdiction X" | Register retrieval OR jurisdiction expansion (add rows in config) | "Retrieve existing obligations for X, or expanding into X for the first time?" |

Silent picks on ambiguity are a defect (playbook §0.5).

---

## Slash-style shortcuts (optional convenience layer)

| Shortcut | Fires | Same as |
|---|---|---|
| `/comply:feeds` | `reg-monitor-routing` | "check the feeds" |
| `/comply:register list` | `obligation-register` Step 6 | "list obligations" |
| `/comply:register add` | `obligation-register` Step 1 | "register this obligation" |
| `/comply:register attest` | `obligation-register` Step 3 | "attest [slug]" |
| `/comply:review` | `obligation-register` Step 5 | "quarterly obligation review" |
| `/comply:readiness` | `regulated-activity-readiness` | "launch gate for [activity]" |

---

## Precedence for cross-skill overlap

Authoritative in `operational/skill/comply-skill-routing.md`. Ambiguous → ASK.
