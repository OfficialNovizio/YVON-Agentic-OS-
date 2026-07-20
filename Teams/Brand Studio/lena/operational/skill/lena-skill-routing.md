---
name: lena-skill-routing
type: operational/skill
status: consolidated from the "Boundaries" sections of lena's skill files — no new logic invented
assigned_agent: lena (Brand Studio / Brand Voice)
date_added: 2026-07-07
---

## Purpose

Lena's routing map. Triggers: `operational/commands/lena-commands.md`.

## Where Identity Fits

Lena has no agent identity — spark holds Brand Studio's. The *writing* personas in humanic-writing's archetypes are skill assets, not agent identity (deliberate rule-6.1 design). Universal-only principles.

## The Writing Pipeline

Every piece of copy lena produces runs the same order:

```
voice-guides            (load the brand's voice — the foundation; no guide → create it
      |                  from real samples before real work)
copywriting             (STRUCTURE: deterministic formula per content type —
      |                  AIDA/PAS/BAB/4Ps/4Us/FAB; variants on request)
email-marketer          (email only: sequence frameworks, cadence, deliverability)
      |
humanic-writing         (ALWAYS LAST writing pass: voice injection + tell-stripping
      |                  + cut ladder)
      v
[Behavioral review — cialdini/kahneman, dormant until Behavioral Science built]
      v
spark's coherence gate  (voice is one of its three references)
```

## Handoff Rules

- **voice-guides → everything**: the loaded guide governs *how* all other skills' output sounds; formula keeps structure, voice wins on wording.
- **copywriting → nate**: conversion variants (the catalog's "draft 3 variants") hand to nate for testing; lena writes, nate measures.
- **email-marketer → connector/operator**: sequences are designed here, sent via the configured transport; consent discipline per the operator's jurisdiction inputs (CASL for Canadian businesses — stricter than the skill's US framing).
- **humanic-writing ← pulse**: pulse's social drafts run lena's humanic pass (and voice guide) before spark — one voice across owned channels.
- **Voice-breaking requests**: flagged with the rule quoted; comply only on logged operator override; repeated overrides amend the guide.
- **Logical layer (pending)**: hook/virality/stickiness formulas await operator-supplied books; until then attraction advice is flagged reasoning-based per rule 0.6.

## Cross-Agent Boundaries

Atlas owns how text is *set* (type, kit); lena owns what it *says and sounds like*. Weave owns which *story* is told; lena words it. Echo consumes lena-quality discipline but owns investor documents itself. Kai measures content performance; lena doesn't self-grade.

## Precedence

"Write X" → structure skill for X's type, then always humanic-writing. "Fix/humanize X" → humanic-writing directly. "Does this sound like us" → voice-guides check. Ambiguous → ask whether the need is drafting, structuring, sequencing, or humanizing.

## Fallback

No voice guide → voice-guides' creation loop first (or explicitly-labeled voice-neutral draft for emergencies). Everything else: each skill's own clarify-first gate.
