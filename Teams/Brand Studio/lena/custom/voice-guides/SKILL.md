---
name: voice-guides
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 Brand Studio v3 build)
based_on_catalog_entry: vyon-voice-guides (VYON_Skills_Catalog_Full_v2.html, lena/Brand Studio) — renamed voice-guides, genericized per rule 0.4b off hardcoded per-venture tones ("Novizio confident size-inclusive, Hourbour plain-spoken worker-first"); voice content becomes an operator-supplied voice-guide file per brand, template provided
assigned_agent: lena (Brand Studio / Brand Voice)
portable: true — the guide's content is per-business; this skill carries only the drafting/checking process and the template
includes: assets/voice-guide-template.md
date_added: 2026-07-07
---

## Introduction

voice-guides is lena's foundation: every brand gets a written voice guide (register, rhythm, vocabulary, banned and required patterns, one good and one bad example), and every piece of copy lena drafts is written in — and self-checked against — that guide. It is the verbal sibling of atlas's brand-guidelines: no written guide, no voice enforcement, ever. The guide is also the required input for `humanic-writing`'s voice-injection pass — this file is where "sounds like us" gets defined.

## Purpose

The blueprint's brand_voice rule says it best: be specific enough that two different models would produce recognizably similar output. Voice that lives in someone's head produces drift with every draft; voice written as testable rules produces consistency at any volume — which is exactly what AI-assisted content production needs most.

## When to Use

Triggers: "write in brand voice," "tone check," "does this sound like us," creating or revising a brand's voice guide, or as the loaded profile whenever lena (or pulse, for social) drafts anything.

## Structure / Protocol

```
Load the voice guide (configured path, per brand)
  -> If none exists: STOP — offer assets/voice-guide-template.md; build it from the
     operator's real samples (never invent a voice)
    -> Draft in the voice (or check a provided draft)
      -> Self-check against banned/required patterns + the guide's examples
        -> Voice-breaking requests → flag to the operator, don't silently comply
```

## Instructions

### Phase 1 — Load or Create

Read the guide from `voice_guide_path` (lena's config, one per brand). If none exists, stop and create one properly: collect **3–10 real writing samples** the operator considers on-voice (their best emails, posts, pages — or a 20-minute talking transcript per the blueprint's record-and-transcribe method), extract the patterns into the template, and have the operator correct it — the corrections are where the voice actually gets encoded. Never draft a voice guide from the business's industry or vibes.

### Phase 2 — Draft

Write with the guide open: its register, sentence-length mix, contraction rule, opinion level, signature moves, and required patterns. Where the guide and a copywriting formula (AIDA/PAS via `copywriting`) pull in different directions, the voice wins on *how* while the formula keeps *structure*.

### Phase 3 — Self-Check

Before presenting any draft: scan for banned words/patterns (each hit named and fixed), verify required patterns present where natural, compare against the guide's good/bad example pair, and read aloud in the voice's cadence. The check output is shown, not silent — same discipline as atlas's audits.

### Phase 4 — Flag Voice-Breaking Requests

A request that requires breaking the guide ("write this in hype-speak" for a plain-spoken brand) gets flagged to the operator with the specific conflicting rule quoted — comply only after explicit override, and log the override; repeated overrides mean the guide needs amending, not ignoring.

## Output Format

Draft + a short check block:

```
### Voice check — [brand], guide [version]
Banned patterns: [none found / fixed: …] · Required patterns: [present/na]
Read-aloud: [pass / adjusted: …] · Conflicts flagged: [none / …]
```

## Principles

- **No guide, no voice work.** A voice inferred from industry norms is nobody's voice.
- **Built from real samples, corrected by the operator.** The corrections are the encoding.
- **Specific enough for two models to converge.** "Friendly but professional" is not a rule; "contractions always, no exclamation marks, one short punch sentence per paragraph" is.
- **Facts never change with voice.** Voice adapts framing and rhythm — claims and numbers stay identical across registers (echo's principle, shared).
- **Overrides are logged; repeated overrides amend the guide.**

## Fallback

- No guide + urgent draft needed → draft in deliberately neutral register, labeled "voice-neutral: no guide exists yet," and start the guide-creation loop.
- Guide exists but pre-dates a brand shift → flag staleness to the operator; don't freelance the new voice.
- Multiple brands, ambiguous target → ask; never guess (multi-brand voice bleed is lena's version of atlas's BLEED).

## Boundaries with Other lena Skills

- `humanic-writing` consumes this guide as its voice-injection input — voice-guides defines the voice; humanic-writing gets a draft into it and strips AI tells.
- `copywriting` supplies conversion structure; this skill supplies how it sounds.
- `email-marketer` writes lifecycle sequences that all pass through this voice.
- Cross-agent: weave's arcs constrain what stories get told; this skill constrains how they're worded. Spark's gate checks voice as one of its three references. Pulse's social drafts load this same guide.
