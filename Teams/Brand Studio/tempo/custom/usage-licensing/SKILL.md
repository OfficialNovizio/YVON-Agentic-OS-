---
name: usage-licensing
type: custom
status: built from scratch — catalog listed this slot as MARKETPLACE ("audio-licensing"), but the 2026-07-08 search found only skills serving musicians SELLING music (sync pitching, catalog prep, rights packaging) — the opposite direction from a brand USING licensed tracks. Converted to custom, flagged (case-law-method precedent).
fulfills_catalog_entry: audio-licensing (VYON_Skills_Catalog_Full_v2.html, tempo/Brand Studio)
assigned_agent: tempo (Brand Studio / Audio Branding)
portable: true — licenses and registry are per-business; the verification protocol is the method
includes: assets/license-registry-template.md
date_added: 2026-07-08
---

## Introduction

usage-licensing is tempo's rights discipline: before any track, sound, or VO asset ships in brand content, its license is **verified for the actual use** (platform, territory, duration, monetization), **documented** in the registry, and only then usable by sound-identity's selection step. It is process, not legal advice — ambiguous license terms route to the operator (and their counsel), never get interpreted hopefully.

## Purpose

Music misuse is the copyright strike small businesses walk into blind: a "royalty-free" track whose license excludes paid ads, a subscription that lapsed while old videos stay live, a platform's content-ID matching a track someone grabbed years ago. The registry makes every audio asset's rights status a documented fact with an expiry date, not a memory.

## When to Use

Triggers: "can we use this track," "license check," "add to the registry," subscription renewals/lapses — and as sound-identity's gate on every selection.

## Structure / Protocol

```
Acquisition or use request
  -> VERIFY the license against the actual use: source · license type · permitted uses
     (org/paid ads/monetized platforms) · territory · duration/expiry · attribution required
    -> Clear fit → REGISTER (append-only) → usable by sound-identity
    -> Ambiguous terms → OPERATOR (and counsel) with the specific clause quoted — never
       hopeful interpretation
    -> New cost → the spend path (operator; board's gate where its scope applies)
  -> MAINTAIN: expiry sweep on cadence — lapsed licenses flag every live asset using them
```

## Instructions

**Verify:** read the actual license (not the marketing page); check the specific intended use against permitted uses — paid-ad use and monetized-platform use are the two most commonly excluded. Quote the permitting clause into the registry entry. AI-generated audio: the generator's terms are the license; same verification.

**Register:** per the template — track, source, license type, permitted uses, territory, expiry, attribution duty, the quoted clause, where it's used. Append-only; status changes (lapse, renewal) are new lines.

**Maintain:** expiry sweep on config cadence; a lapsed license flags every registered use of it (the registry's uses column exists for exactly this); renewals or takedowns route to the operator.

## Output Format

Per check: `[track] · [use requested] → CLEARED (clause quoted, registry ID) / AMBIGUOUS → operator (clause quoted) / NOT PERMITTED (clause quoted)`.

## Principles

- **The license text governs, quoted — never the marketing page or memory.**
- **Verified for the actual use** — platform, paid/organic, territory, duration.
- **Ambiguity routes up with the clause; hopeful interpretation is prohibited.** Not legal advice; counsel questions are the operator's.
- **Append-only registry; expiries swept; lapses flag live uses.**
- **No registry entry, no use** (sound-identity's law, enforced here).

## Fallback

- Unlicensed asset found already live → flag to the operator with options (license it, replace it, remove it) — never quietly ignored.
- Registry empty (new brand) → starts with the first acquisition; historic content gets a labeled backfill audit if the operator wants one.

## Boundaries with Other Skills

- `sound-identity` (sibling) selects from what this skill has cleared — fit there, rights here.
- **board's** fiduciary gate applies to license spend at its thresholds; **sentinel's** audit-trail discipline shapes the registry; **jurisdiction specifics** (Canadian copyright particulars, etc.) are operator/counsel inputs, per the system-wide rule.
