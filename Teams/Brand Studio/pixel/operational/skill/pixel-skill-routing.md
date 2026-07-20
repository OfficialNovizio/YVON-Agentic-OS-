---
name: pixel-skill-routing
type: operational/skill
status: consolidated from the "Boundaries" sections of pixel's skill files — no new logic invented
assigned_agent: pixel (Brand Studio / Production)
date_added: 2026-07-07
---

## Purpose

Pixel's routing map. Triggers: `operational/commands/pixel-commands.md`.

## Where Identity Fits

Pixel has no identity — spark holds Brand Studio's. Universal-only principles.

## The Production Stack (three skills, one flow)

```
image-style-guide    (SETUP, once per brand: kit §5 → prompt constants + templates +
      |               reject rules; operator-approved on a real test set, then frozen)
      v
content-image        (CRAFT, per prompt: four-component structure, model-specific
      |               optimization, negative prompts, variations)
      v
asset-pipeline       (WORKFLOW, per brief: shot list → confirm → generate → QA vs
                      atlas's kit → name per convention → deliver with manifest)
```

## Handoff Rules

- **Briefs in**: from lena (campaigns), pulse (social series), rio (ad creatives), muse-developed concepts. Requesters own intent; pixel owns on-kit execution. Shot lists confirm before generation.
- **atlas** owns the QA rules pixel executes per asset; repeated rejects route to atlas/spark as template-or-kit review, never patched silently.
- **lena** supplies overlay copy pre-voice-checked; pixel never writes copy.
- **spark's gate** is downstream of every delivery — the QA trail travels with the manifest.
- **tempo** (when built) pairs audio; **no generation connector** → prompts + shot list ARE the deliverable, operator generates externally, assets return for QA/naming.

## Precedence

"Produce/batch X" → asset-pipeline (full flow). "Better prompt for X" → content-image directly. "Set up / fix our image style" → image-style-guide. Ambiguous → ask whether the need is setup, one prompt, or a production run.

## Fallback

No kit → unaudited-draft label only, never final. No style guide → provisional generic craft, labeled, with the setup loop proposed.
