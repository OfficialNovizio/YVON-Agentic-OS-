---
name: sound-identity
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 Brand Studio v3 build; tempo deliberately built last — optional for small businesses, dormant until a brand does audio/video)
based_on_catalog_entry: vyon-sound-identity (VYON_Skills_Catalog_Full_v2.html, tempo/Brand Studio) — renamed sound-identity, genericized per rule 0.4b; sonic guidelines become an operator-approved file per brand, template provided
assigned_agent: tempo (Brand Studio / Audio Branding)
portable: true — sonic content is per-brand; this skill carries the process and template
includes: assets/sonic-guide-template.md
date_added: 2026-07-07
---

## Introduction

sound-identity is the fourth definer: what the brand *sounds* like — music mood ranges, VO tone, sonic do/don'ts — written as an operator-approved sonic guide per brand, consumed whenever video, podcast, or audio content gets made. Same law as atlas/lena/weave: no written guide, no sonic enforcement. For brands doing no audio content, tempo is a documented no-op — the folder exists, nothing runs.

## Purpose

Audio is the brand dimension most teams improvise: every video gets whatever track felt right that day, VO tone drifts per producer, and nothing accumulates. For brands where video/audio matters (which increasingly means any brand pulse serializes to TikTok/Reels/YouTube), the sonic guide makes sound a brand asset instead of a per-edit mood.

## When to Use

Triggers: "video music," "sound for [content]," "VO tone," "build our sonic guide" — invoked by pixel/pulse whenever produced content carries audio.

## Structure / Protocol

```
Load the brand's sonic guide (config path)
  -> If none: BUILD with the operator (template; derived from the brand kit's mood +
     voice guide's register + real reference tracks the operator approves)
    -> Select for the content: mood range match + licensed-registry-only (usage-licensing
       skill governs what "licensed" means)
      -> New license need → cost + scope to the operator BEFORE use (spend gates apply)
        -> Selections logged; drift (off-guide choices) flagged like any definer's audit
```

## Instructions

**Build (once per brand):** derive from what exists — atlas's kit mood, lena's register (a plain-spoken brand doesn't get cinematic bombast), weave's arc emotional range — plus operator-approved reference tracks. Encode as the template's testable statements ("energetic but never frantic; acoustic over synthetic; VO: warm, unhurried, no announcer voice"). Operator sign-off freezes v1.

**Select (per content):** match the content's chapter/mood to the guide's ranges; choose **only from the licensed registry** (usage-licensing's ledger); document the selection per output. A need outside the registry → the license request path, never "grab it and hope."

**Maintain:** selections log; repeated off-guide requests → guide review (amendment, operator-owned); the guide is versioned like every definer document.

## Output Format

Per selection: `[content] → [track/registry-ID] · guide-fit: [range matched] · license: [registry ref]`. Guide build/amendments follow the template.

## Principles

- **No guide, no sonic enforcement; no registry entry, no track.**
- **Derived from the other definers** — sound never contradicts voice, kit, or arc.
- **License before use, cost before commitment.**
- **Dormant is a state**: no-audio brands get an explicit no-op, structure intact.

## Fallback

- No guide + urgent content → neutral selection labeled "no sonic guide," build loop starts.
- No registry yet → usage-licensing's acquisition path runs first; nothing unlicensed ships.

## Boundaries with Other Skills

- `usage-licensing` (sibling) owns what may legally be used; this skill owns what *fits*.
- **pixel** produces the content this scores; **pulse's** platform playbooks note per-platform audio norms; **spark's** gate covers audio coherence once a guide exists (a fifth reference, noted as dormant-until-built in coherence-qa's spirit).
