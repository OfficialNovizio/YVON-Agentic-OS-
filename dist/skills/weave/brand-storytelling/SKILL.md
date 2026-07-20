---
name: brand-storytelling
agent: weave
department: Brand Studio
version: 1.1.0
tier: 2
description: |
  Help the user craft compelling narratives that make their brand memorable using techniques from 30 product leaders and storytelling experts. (yvon)
triggers:
  - brand storytelling
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/weave/marketplace/brand-storytelling/SKILL.md
  source_hash: 7d247865e8987de5942790f086efb9e3901185a35d602f98b1bcbbd28b1cdad4
  generated: 2026-07-20T03:20:23.963Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/weave/marketplace/brand-storytelling/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js weave -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: weave — Brand Studio · skill: brand-storytelling"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"weave\",\"skill\":\"brand-storytelling\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "brand storytelling".

## Purpose

Help the user craft compelling narratives that make their brand memorable using techniques from 30 product leaders and storytelling experts.

## Protocol

# Brand Storytelling

Help the user craft compelling narratives that make their brand memorable using techniques from 30 product leaders and storytelling experts.

## How to Help

When the user asks for help with brand storytelling:

1. **Understand the context** - Ask who the audience is (investors, customers, employees) and what action they want to inspire
2. **Find the core story** - Help identify the transformation, movement, or unique insight at the heart of the brand
3. **Structure the narrative** - Apply proven frameworks to organize the story effectively
4. **Make it memorable** - Help craft specific phrases, metaphors, and moments that stick

## Core Principles

### Lead a movement, don't just solve a problem
Andy Raskin: "This structure is about defining a movement—that's very different from 'I'm going to solve your problem.'" Frame your brand as the leader of a shift toward a new way of winning.

### Story before product
Brian Chesky: "One of the first things we do is figure out what the story is. The story often dictates the product. A story is a helpful way to develop a cohesive product." Define the narrative before finalizing features.

### Find the five-second moment
Matthew Dicks: "Every story is about a singular moment—I call it five seconds. A moment of transformation or realization. 98% of the story provides context to make that moment clear." Identify the single moment of change.

### Start in the middle of the action
Merci Grace: "Every pitch should start in the middle of the action, like Mission Impossible. Tom Cruise is always doing crazy shit before the actual mission. It gets attention." Skip the boring setup—hook them immediately.

### Problems beat successes
Jason Feifer: "Success stories aren't interesting. Problem-solving stories are. Frame your story around a specific challenge you faced and the counterintuitive way you solved it."

### You're Obi-Wan, not Luke
Mike Maples Jr: "The customer is the hero (Luke Skywalker), the founder is the mentor (Obi-Wan) providing the tools. Position your product as the lightsaber—the tool the hero needs."

### Make it repeatable
Lulu Cheng Meservey: "Make it memorable. Make people want to say it of their own volition. Use analogies, colorful mental images, jokes. Replace adjectives with anecdotes people can repeat at dinner."

### Paint emotional pictures
Camille Ricketts: "Effective storytelling paints an emotional picture of the vision. Convey the emotional quality of the mission, not just technical details, to enlist hearts and minds."

### Hook, message, celebration
Christina Wodtke: "A beginning, middle, and end. Intrigue with a hook—a mystery, secret, or surprise. The middle delivers the message. Always end with success and celebration."

### Memify your insights
Yuhki Yamashata: "The goal is 'memification'—synthesize insights so they're catchy enough for execs to cite in meetings. Use metaphors to explain complex concepts."

## Questions to Help Users

- "Who is your audience and what do you want them to do after hearing this?"
- "What's the transformation or realization at the heart of your story?"
- "What problem did you face that others can relate to?"
- "Can someone repeat your core message at a dinner party?"
- "Are you the hero of this story, or is your customer?"

## Common Mistakes to Flag

- **Starting with your company** - Start with the audience's problem or the world's change, not "We are..."
- **Feature lists instead of stories** - Stories are about change; lists are forgettable
- **Hero syndrome** - Position yourself as the mentor, not the hero
- **Vague vision** - "Making the world better" isn't a story; be specific
- **No stakes** - If nothing's at risk, there's no tension

## Deep Dive

For all 50 insights from 30 guests, see `references/guest-insights.md`

## Related Skills

- Positioning & Messaging
- Giving Presentations
- Fundraising
- Media Relations

## Boundaries & handoffs

- **brand-story-arcs → brand-storytelling → lena**: approved chapter → craft treatment (hook, moment, stakes) → lena's voice + humanic pass. Weave never wordsmiths final copy.
"Does this fit our story / what's the story here" → brand-story-arcs. "Make this story better / hook / structure" → brand-storytelling (after arc check if it's campaign-bound). "Build our story" → arc creation loop. Ambiguous → ask whether the need is positioning (architecture) or telling (craft).
No arc → brand-story-arcs' Phase-1 stop (build from real history, or labeled pre-arc content). Craft questions with no campaign attached run brand-storytelling standalone.

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"weave\",\"skill\":\"brand-storytelling\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
