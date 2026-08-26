# ORCHESTRATION — the Work Ladder

**Status:** design, not built. Nothing in this document exists in the codebase yet
except where a line says otherwise.
**Companion artifacts:** *The Work Ladder* (narrative spec), *Ladder, Running*
(playable demo of §5).
**Supersedes:** nothing. **Extends:** `docs/PRD-design-first-workflow.md`,
`docs/PRD-prd-gated-task-conversion.md`, `docs/CAOS-V2.md`.

---

## 0. Why this document exists

We have ~40 agents across 14 departments, ~200 skills, a task system with a real
state machine, a design-session state machine in `cli/design.py`, Hermes with
terminal and delegation, and a tool estate (krea, screenshot-to-code,
open-design, Figma, graphify, MemPalace).

Nothing **coordinates** them. Every connection is point-to-point:

| Connection | Reality today |
|---|---|
| chat → task | one fenced block the model emits when it decides it is finished |
| `design.py` → PRD | works, but only from a terminal — chat cannot start, advance or approve a session |
| skills | matched by keyword; nothing knows a skill needs `KREA_API_KEY` to function |
| tools | never verified before use; screenshot-to-code is running with no key |
| departments | `routeAgents` returns a `team` array that nothing executes as a team |
| money | `cli/design.py` `_load_pricing()` returns `{"screenshot_capture_usd": 0.0, "code_gen_usd": 0.0}` with source `"default-zero-unconfigured"` because `pricing.json` does not exist — **every estimate the system has ever printed is $0** |

So "make me a scroll animation" has no home. Too big for a chat turn, no task yet,
needs three departments, spends real money, depends on an API whose contract our
own skill file flags as unverified.

---

## 1. The ladder

Three rungs. Cost rises left to right; reversibility falls.

```
   CHAT  ─────────────▶  SESSION  ─────────────▶  TASK
   unstructured           multi-turn               PRD, execution
   one turn               multi-department         repo access
   no commitment          gated, preflighted       TASK-SPEC lifecycle
                          metered
   cost: tokens           cost: probes +           cost: highest
   reversible: fully      generations              reversible: rework only
                          reversible: at each gate
                          ▲ THE MISSING RUNG
```

`cli/design.py` is already one instance of the middle rung
(`trigger → review → draft_ready → spend → ready → handed_off`, terminal
`abandoned` / `declined`). **This work generalises that state machine; it does not
invent it.**

---

## 2. Session anatomy

A session is generic. `design.motion` is one *kind*; so are `design.reproduce`,
`content.campaign`, `research.market`, `eng.migration`. Each kind declares six
things and the engine is identical for all of them.

| Part | Declares | Status today |
|---|---|---|
| **Manifest** | required contributions — role, owning department, what it produces | new |
| **Gates** | ordered human decisions, each with a cost-to-reject | partial (`design.py` has 2) |
| **Preflight** | capability checks that must pass before any spend | new |
| **Probe policy** | how many cheap samples, and what varies between them | new |
| **Ledger** | every generation: provider, model, params, units, cost | new |
| **Rate card** | dynamic pricing per `provider × model × kind` | flat (two constants, both $0) |
| **Handoff** | transcript → `generatePrd()` → task | **built** |

### 2.1 The rule that orders everything

> **Gates ascend by cost-to-reject.** Each gate must be cheaper to fail than the
> one after it.

That single constraint produces the whole shape: text before pixels, one probe
before a batch, a batch before assembly. Any gate ordering that lets you spend
before you can reject is wrong by construction.

Corollary: **the model never authorises spend.** It proposes; a gate is a human
decision. Same principle as the execution lock built for concern #5, applied to
money instead of to files.

### 2.2 Session state

```
proposed → gathering → preflight → gated(n) → generating → assembled → handed_off
                                       │
                          declined ◀───┴───▶ abandoned
```

`gated(n)` is re-entered once per gate. A session may sit in `gated(n)`
indefinitely; nothing expires without a human or an explicit TTL on the kind.

---

## 3. Pricing

Two separate things. Conflating them is why this is hard.

### 3.1 The rate card — what things *cost*

Keyed by `provider × model × kind`, each with a small rate **expression** rather
than a flat price, because providers price differently by nature: images per
megapixel, video per second, LLMs per token.

```json
{
  "krea/flux-1.1-pro/image": {
    "unit": "megapixel", "usd_per_unit": 0.04,
    "modifiers": { "quality:max": 1.5 }
  },
  "krea/kling-2.1/video": {
    "unit": "second", "usd_per_unit": 0.28,
    "modifiers": { "res:1080p": 1.8, "res:720p": 1.0 }
  },
  "higgsfield/*/video":     { "unit": "second", "usd_per_unit": null },
  "openai/gpt-image-1/image": { "unit": "image", "usd_per_unit": 0.19 }
}
```

Rules:

- The card is **data**, hot-reloadable, versioned. Swapping krea for higgsfield or
  for a self-hosted OSS repo driven by an OpenAI/Claude/DeepSeek key is a card
  edit, not a code change.
- `usd_per_unit: null` means **unpriced**, which is not free.
- Rates are rounded to whole cents at write time so a ledger's rows sum exactly to
  its total. An estimate and its invoice must never disagree.

### 3.2 The generation ledger — what you actually *spent*

One row per generation, written **at the moment of the call**, not reconciled
afterwards from a receipt.

```json
{
  "session_id": "…", "gate_passed": "approve-spend", "kind": "dive · s3",
  "provider": "krea", "model": "kling-2.1",
  "params": { "width": 1920, "height": 1080, "aspect": "16:9",
              "quality": "1080p", "seconds": 5, "fps": 24, "seed": 41822 },
  "units": 5.0, "unit": "second", "multiplier": 1.8,
  "cost_usd": 2.52, "pricing_source": "card@2026-08-22",
  "prompt_shape": "json", "asset_uri": "…", "ts": "…"
}
```

> **null is not zero.** An unpriced model records `cost_usd: null,
> pricing_source: "unpriced"` — never `0`. Same discipline as the CAOS v2 panel: a
> number you don't have must never render as a number you do. A `$0` total on a
> batch that cost real money is the single most dangerous output this system can
> produce.

Session totals are always reported as *priced total + n unpriced*, never as one
number that silently swallows the unknowns.

---

## 4. Preflight

Three states, checked against **the plan**, not against the whole estate:

| State | Meaning | Effect |
|---|---|---|
| **working** | credential present *and* a live call succeeded | proceed |
| **configured-but-failing** | credential present, call failed | blocks `approve-spend` if the plan needs it |
| **not-configured** | credential absent | blocks `approve-spend` if the plan needs it; otherwise reported and ignored |

Known today: `screenshot-to-code` has no `OPENAI_API_KEY` and would fail
mid-session with no warning. Preflight is what turns that from a $$$ surprise into
a line item before anything is authorised.

A capability the plan does not use is **reported, not blocking**. A capability the
plan does use and that is not working makes `approve-spend` unreachable — the gate
is not "warned past", it is closed.

---

## 5. Worked example — `design.motion`

*"I need a scroll animation for the landing page."* Three departments, one
session, four gates. This is the sequence the **Ladder, Running** demo plays.

1. **Read + route.** Tier `build`. Three departments score above threshold —
   design.motion 8, brand 5, writing 4. No single agent owns it ⇒ escalate to a
   session. *Scores are shown, not hidden — this is the fix for the brand-studio
   misroute.*
2. **Clarify, do not start.** Session opens `proposed` and asks the three
   questions that determine cost: how many sections, real product or abstract,
   what ceiling. **The budget is an input, not a surprise.**
3. **Manifest fills.** atlas (brand) → palette and prohibitions. lena (writing) →
   six section beats, copy fixed before any pixel. mia (design.motion) → camera
   plan, 17 generations, mobile fallback at 11. *The session decides the manifest
   is complete — not the model.*
4. **Preflight.** krea working; scroll-world skill verified; screenshot-to-code
   not configured *and not required here*; higgsfield reachable but unpriced.
5. **Gate 1 · direction** — text only. Rejecting costs one turn.
6. **Probes — batch size 2, one variable.** Both render the *same* section at full
   section granularity. **A sends a structured JSON prompt; B sends the same
   intent as a prose paragraph.** Same seed, same section, one variable, so the
   comparison means something. ~$3.04 buys the answer to "does this approach
   work" before ~$23.39 assumes it does.
7. **Gate 2 · pick a variant.** The winning `prompt_shape` is written into the
   session so all 17 generations inherit it. The loser is *recorded, not deleted*.
8. **Gate 3 · approve spend.** Itemised from the same card the ledger will use.
   **The model cannot pass this gate.**
9. **Batch.** 17 generations, rows written at call time. One `higgsfield` row
   carries `cost: null`.
10. **Gate 4 · accept**, then handoff: `TASK-2611` with the PRD carrying the
    approved beats, the locked palette, 17 assets with their ledger rows, and the
    recorded `prompt_shape` so regeneration is reproducible.

**Six of seventeen generations tell you whether it works. That ratio is the whole
argument for the middle rung.**

---

## 6. The same six parts, other departments

The engine does not know it is doing design.

| Kind | Manifest | Probe (×2, one variable) | Spend gate |
|---|---|---|---|
| `design.reproduce` | screenshot → structure, tokens, component map | two extraction strategies on one section | code-gen attempts |
| `content.campaign` | brand voice, channel constraints, asset list | two tone variants on one post | image/video generation |
| `research.market` | question set, source policy, output shape | two query strategies on one sub-question | paid API calls, deep-research turns |
| `eng.migration` | inventory, blast radius, rollback plan | two transform strategies on one module | CI minutes, agent-hours |

In every case the probe is a **cheap sample at full granularity of the real unit
of work** — never a smaller, easier version of it. A probe on half a section
proves nothing about a section.

---

## 7. Build order

1. **Rate card + ledger.** Pure data and a pricing function. No UI, no session.
   Immediately replaces the two `$0` constants in `cli/design.py`.
2. **Preflight registry.** Skills declare required credentials; a checker that
   reports the three states.
3. **Session core.** Generalise `cli/design.py`'s state machine; `design.motion`
   as the first non-`design.reproduce` kind.
4. **Gates in chat.** The session rail (312px, CAOS v2 shell) renders gates;
   approve/decline are real actions, not fenced blocks.
5. **Manifest + cross-department execution.** Make `routeAgents.team` actually
   execute as a team against a manifest.
6. **Handoff.** Session transcript → existing `generatePrd()` → task. This one
   already exists; it just gets a validated brief instead of a guess.

Steps 1 and 2 are worth doing on their own even if nothing else lands: they turn
"we spent an unknown amount on tools that may not be configured" into two answered
questions.

---

## 8. Open questions

- **Ledger storage.** The `events` table has no `room_id` (only `context_id` =
  workspace slug). A generation ledger probably wants its own table keyed by
  `session_id`, not an `events` row.
- **Card provenance.** Who edits the rate card, and does a stale card block spend?
  Proposal: cards carry a `checked_at`; older than 30 days downgrades the estimate
  to "indicative" but does not block.
- **Ceiling enforcement.** Hard stop at the ceiling, or a fifth gate when a batch
  would cross it? Current lean: hard stop, because a gate at the ceiling is a gate
  the user will reflexively approve.
- **Probe reuse.** If probe A's output is good enough to ship as section 3, is it
  reused or regenerated? Reusing saves ~$1.52 and makes the ledger honest;
  regenerating keeps the batch homogeneous.
