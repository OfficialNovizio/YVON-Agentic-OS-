---
name: lena-commands
type: operational/commands
status: consolidated from trigger phrases in lena's skill files — no new triggers invented; precedence rules added where triggers overlap
assigned_agent: lena (Brand Studio / Brand Voice)
date_added: 2026-07-07
---

## Purpose

Routing reference for lena: phrase → skill, plus precedence for overlapping writing vocabulary.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| voice-guides | "write in brand voice," "tone check," "does this sound like us," "build our voice guide" | `/lena-voice` |
| copywriting | "landing copy," "headline," "ad copy," "product description," "make this convert" | `/lena-copy` |
| email-marketer | "email flow," "welcome series," "subject lines," "newsletter," "why is our email in spam" | `/lena-email` |
| humanic-writing | "humanize this," "this sounds AI," "de-slop," "rewrite in our voice" | `/lena-humanize` |

## Precedence Rules

### Every draft ends in humanic-writing
Whatever skill produced it, the final writing pass is humanic-writing (voice injection + tell strip + cut ladder). "Write a landing page" = copywriting → humanic-writing, automatically.

### "Rewrite this" — structure vs sound
Draft has the right structure but reads AI/off-voice → humanic-writing. Draft has the wrong bones (no hook, buried CTA, wrong formula) → copywriting (or email-marketer) first, then humanic-writing.

### Email is email-marketer's lane
Any lifecycle/sequence/deliverability question routes there even if phrased as "copy" — its frameworks own cadence and segmentation; copywriting's PAS still applies inside individual emails.

### What lena does NOT take
- Social calendars, platform formats, community replies → pulse (which borrows lena's voice + humanic pass).
- Story arcs and campaign narrative → weave.
- Investor documents → echo. SEO content strategy → kai.
- Persuasion-principle selection and ethics lines → Behavioral Science (cialdini) when built; until then lena flags persuasion questions as outside her lane rather than improvising psychology.

## Fallback

No clear match → ask: drafting, structuring, sequencing, or humanizing?
