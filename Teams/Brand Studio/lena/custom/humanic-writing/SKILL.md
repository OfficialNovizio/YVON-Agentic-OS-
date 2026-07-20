---
name: humanic-writing
type: custom
status: built by merge (not a pure marketplace copy) — the centerpiece of the 2026-07-07 humanic-content strategy discussion
sources_referenced:
  - voice-injection-rewriter (guia-matthieu/clawfu-skills, MIT) — the voice-profile load, AI-fingerprint scan, and 5-pass voice-injection rewrite; its core insight kept intact: make text sound like a SPECIFIC voice, never "human in general" — no fake imperfections
    https://skillsmp.com/creators/guia-matthieu/clawfu-skills/skills-content-voice-injection-rewriter
  - concise-writing (l4ci/latticework) — the cut ladder, the compressed AI-tell catalog (from Wikipedia's "Signs of AI writing" + Strunk/White/Zinsser/Williams lineage), the over-trimming guardrail, the read-aloud loop
    https://skillsmp.com/creators/l4ci/latticework/skills-concise-writing
fulfills_catalog_entry: none — new skill added per Brand Studio v3; addresses the operator's stated top problem (AI content that isn't humanic or people-attracting)
assigned_agent: lena (Brand Studio / Brand Voice)
portable: true — voice comes from each business's voice-guide file; archetypes are trait-based starting points, not company or person specifics
includes: assets/ai-tells-catalog.md (the compressed tell catalog, adapted from concise-writing's reference), assets/writer-archetypes.md (selectable trait-based voice archetypes)
logical_layer_hook: the ATTRACTION half of this skill (hooks, virality, emotional stickiness) is deliberately thin until real books are supplied and extracted per playbook §8 — priority sources named in lena's logical/book-requirements.md. This skill makes text HUMAN; the books will make it PULL.
date_added: 2026-07-07
---

## Introduction

humanic-writing turns AI-drafted content into text a specific human could have written — not by faking typos or forcing slang, but by injecting a real voice and stripping the specific, nameable tells of machine prose. It merges two sources that attack the problem from opposite ends: voice-injection-rewriter's principle that the fix is *specificity* ("sound like ME," never "sound human"), and concise-writing's discipline that machine tells are *rewritten around the concrete claim underneath*, never just deleted. Every lena and pulse draft passes through this skill before it goes anywhere.

## Purpose

The operator's stated problem: scripts and content that read as AI — generic, rhythmless, hedge-ridden, and unattractive. The diagnosis this skill is built on: AI text fails not because it lacks imperfections but because it lacks a specific person's vocabulary, rhythm, opinions, and structural habits — plus it carries a known catalog of machine fingerprints. Both are fixable mechanically. What this skill does *not* claim: the psychology of attraction (hooks that pull, ideas that stick) — that's the logical layer's job once real source books arrive, and this skill's frontmatter says so honestly.

## When to Use

Triggers: "humanize this," "this sounds AI," "de-slop," "make it sound like us," "rewrite in our voice" — and automatically as the final writing pass on every lena draft (copy, email) and every pulse draft (social) before spark's gate.

## Structure / Protocol

```
Load the voice (brand voice-guide file — required; archetype only as seasoning)
  -> Fingerprint scan (the tell catalog: clusters, not single words)
    -> 5-pass rewrite:
       1 kill AI vocabulary → the voice's actual words
       2 break rhythm uniformity (short punches, varied lengths, fragments if the voice uses them)
       3 inject voice-specific patterns (signature moves, openers, opinion habits)
       4 contraction & register pass
       5 read-aloud test ("would this brand actually say this sentence?")
    -> Cut ladder (whole units first: does it need to exist → already said → context carries it
       → shorter word → strip scaffolding)
      -> Restore check (no cut turned a qualified claim false; specifics and personality survived)
        -> Output with before/after + what-changed note
```

## Instructions

### Phase 1 — Load the Voice

The voice source, in order of strength: **(a)** the brand's voice-guide file (lena's voice-guides skill — the standard case), **(b)** 3–5 operator-supplied writing samples, **(c)** an archetype from `assets/writer-archetypes.md` *combined with* whatever brand material exists. An archetype alone is a starting point for businesses with no voice yet — flag that state and route to voice-guides to build the real thing. **Never run this skill voiceless**: generic humanization is the commodity failure the source skill warns about.

### Phase 2 — Fingerprint Scan

Scan against `assets/ai-tells-catalog.md`. Judge by **clusters, not single hits** — one stray transition word is human; inflated-significance phrasing plus a forced triplet plus fake-depth "-ing" tails is generated. Report the scan (buzzword count, rhythm uniformity, hedging density, opinion presence) so the operator sees what's being fixed.

### Phase 3 — The 5-Pass Rewrite

Per the protocol above. The two non-negotiables from the sources: **rewrite tells around the concrete claim underneath — never delete the trigger word and leave a stump**; and every injected pattern comes **from the loaded voice**, not from a generic "human-sounding" repertoire. Facts, numbers, and qualifiers are preserved exactly — a voice-matched claim that became false is a worse failure than a robotic true one.

### Phase 4 — Cut Ladder

Top-down: kill whole sections/sentences the takeaway doesn't need → cut restatements (intros that preview, closers that recap) → drop what context carries → shorter words → strip scaffolding ("it's important to note that"). **The over-trimming guardrail applies**: qualifiers that keep claims true, concrete specifics, and personality (asides, opinions, varied rhythm) are the *last* things cut, not the first. The floor is meaning, not word count.

### Phase 5 — Restore, Read Aloud, Ship

Read the full text aloud in the voice's cadence; rewrite any sentence the brand would never say, from scratch, in the voice. Verify the restore check. Then output.

## Output Format

```
## Rewritten ([brand] voice, guide [version] [+ archetype if used])
[the text]

### What changed
Vocabulary: [key swaps] · Rhythm: [what broke the uniformity] · Voice markers injected: [which]
Cut: [whole units dropped] · Preserved deliberately: [qualifiers/specifics kept]
Fingerprint scan: [before → after]
```

Quick mode for batches: rewritten text + one footer line.

## Principles

- **Specific voice or nothing.** "Sounds human" is a commodity; "sounds like this brand" is the craft. No fake imperfections, ever — authenticity, not deception.
- **Rewrite tells, don't strike them.** A deleted buzzword in a still-generated sentence fixes nothing.
- **Clusters convict, single tells don't.**
- **Cut whole units before trimming words.**
- **Specifics and true qualifiers survive every pass.** LLMs round detail off; don't finish the job.
- **The read-aloud test is the final judge.** Every sentence: would this voice actually say it?
- **Human where it matters, honest everywhere.** This skill never fabricates experiences, credentials, or first-person events the brand didn't have.

## Fallback

- No voice source at all → stop; route to voice-guides. A neutral tell-stripping pass is offered only as explicitly-labeled partial service.
- Source draft is factually thin → humanizing can't fix empty; flag that the problem is substance (route back to the brief/weave) before style.
- The voice guide itself contains AI-tell patterns as "required" → flag the conflict to the operator rather than propagating slop with a license.

## Boundaries with Other Skills

- `voice-guides` defines the voice; this skill applies it. `copywriting` structures for conversion; this skill makes the structured draft sound human — run copywriting first, this last.
- pulse's social drafts and `email-marketer` sequences all end here before spark's gate.
- **Behavioral Science (when built):** cialdini/kahneman review sits between this pass and spark — persuasion principles and attention framing are their lane; this skill deliberately doesn't improvise psychology.
- **Logical layer (pending):** hook formulas, virality frameworks (STEPPS-class), stickiness structures await operator-supplied books per lena's book-requirements — extracted with citations, never paraphrased from memory.
