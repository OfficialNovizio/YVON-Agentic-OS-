# guard · commands

> Trigger table mapping natural-language phrases to which guard skill fires. Precedence in `operational/skill/guard-skill-routing.md`.

---

## Natural-language triggers → skill

| Phrase pattern | Fires | Notes |
|---|---|---|
| "clearance check" · "trademark clearance" · "trademark availability" · "can we use this mark" · "knockout search" · "is this name available" · "check this mark" | `ip-routing` → `clearance` | TM pre-adoption |
| "oss review" · "open source license check" · "can we ship this library" · "license compliance check" · "review our dependencies" · "copyleft check" · "AGPL check" · "SBOM review" | `ip-routing` → `oss-review` | OSS compliance |
| "infringement check" · "infringement triage" · "are they infringing our IP" · "are we infringing their IP" · "knockoff surfaced" · "copycat check" · "is this a c and d situation" · "trademark infringement" · "copyright infringement" · "patent infringement" · "trade secret misappropriation" | `ip-routing` → `infringement-triage` | Cross-right analysis |
| "what IP do we own" · "list our trademarks" · "list our domains" · "list our patents" · "IP registry" · "IP inventory" | `ip-registry` (retrieve) | State query |
| "add this trademark" · "register this trademark filing" · "register this domain" · "register this patent" | `ip-registry` (mutate) | Post-clearance / post-issuance recording |
| "IP renewal calendar" · "what's coming up for renewal" | `ip-registry` (calendar) | Renewal view |
| "retire this IP asset" | `ip-registry` (retire) | Abandonment / market exit |

---

## Ambiguous phrasings → ASK, don't guess

| Phrase | Why ambiguous | What to ask |
|---|---|---|
| "trademark this" | Clearance first OR record post-adoption | "Do you want a clearance check on a proposed mark, or record a mark you've already adopted/filed?" |
| "add this trademark" | Same ambiguity | Same |
| "IP" (bare noun) | Registry state OR clearance / infringement analysis | "Are you asking about existing IP (registry), a new mark (clearance), or an infringement question?" |
| "check this library" | OSS review OR clearance on a library name (trademark) | "Open source license check, or trademark availability?" |

Silent picks are defects (playbook §0.5).

---

## Slash-style shortcuts (optional convenience layer)

| Shortcut | Fires | Same as |
|---|---|---|
| `/guard:clearance` | `ip-routing` → `clearance` | "trademark clearance" |
| `/guard:oss` | `ip-routing` → `oss-review` | "OSS license check" |
| `/guard:infringe` | `ip-routing` → `infringement-triage` | "infringement triage" |
| `/guard:registry list` | `ip-registry` retrieval | "list our IP" |
| `/guard:registry add` | `ip-registry` Step 1 | "add this trademark" |
| `/guard:registry renew` | `ip-registry` Step 3 | "renew [slug]" |
| `/guard:calendar` | `ip-registry` Step 7 | "IP renewal calendar" |

---

## Precedence for cross-skill overlap

Authoritative in `operational/skill/guard-skill-routing.md`. Ambiguous → ASK.
