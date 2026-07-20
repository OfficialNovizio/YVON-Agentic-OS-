---
name: hook-writing
agent: pulse
department: Brand Studio
version: 1.1.0
tier: 2
description: |
  A methodology for designing hooks that capture the viewer within the first 5–10 seconds. (yvon)
triggers:
  - hook writing
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/pulse/marketplace/hook-writing/SKILL.md
  source_hash: 69eb79e114d0a7b81bef7db70f55f4f0b127feab7e7466d19f30a447713489ba
  generated: 2026-07-20T03:20:23.801Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/pulse/marketplace/hook-writing/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js pulse -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: pulse — Brand Studio · skill: hook-writing"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"pulse\",\"skill\":\"hook-writing\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "hook writing".

## Purpose

A methodology for designing hooks that capture the viewer within the first 5–10 seconds. Extends the scriptwriter agent's hook-crafting capabilities.

## Protocol

# Hook Writing — YouTube Hook Specialist Guide

A methodology for designing hooks that capture the viewer within the first 5–10 seconds. Extends the scriptwriter agent's hook-crafting capabilities.

## The Psychology of Hooks

Viewers decide whether to keep watching within an average of **3 seconds**. When the first-30-second retention rate exceeds 70%, the probability of algorithmic recommendation increases dramatically.

**Core Principle**: A hook must create a **Curiosity Gap** — the tension between what the viewer "wants to know" and what they "don't yet know."

## 15 Hook Patterns

### 1. Shocking Stat

"87% of people don't know about this"

- **How it works**: Cognitive dissonance — "Am I one of them?"
- **Best for**: Education, informational, health videos

### 2. Contrarian Statement

"Exercising too much actually makes you gain weight"

- **How it works**: Challenges existing beliefs → viewer wants to see the evidence
- **Best for**: Science, lifestyle, business videos

### 3. Result First

"This method tripled my monthly revenue. Let me show you how"

- **How it works**: Showing proof first builds trust in the methodology
- **Best for**: Tutorials, testimonials, business videos

### 4. Time Pressure

"Do NOT do this before watching this video"

- **How it works**: Loss aversion — fear of missing out
- **Best for**: Warnings, tips, news videos

### 5. Story Opening

"Three years ago, I lost everything"

- **How it works**: Narrative tension — "What happened next?"
- **Best for**: Vlogs, documentaries, interview videos

### 6. Provocative Question

"Why do rich people never buy this?"

- **How it works**: Self-reference effect — "What about me?"
- **Best for**: Lifestyle, finance, psychology videos

### 7. Before/After

"[Before shot] → [After shot] This transformation took just 30 days"

- **How it works**: Visual proof provides instant persuasion
- **Best for**: Transformation, review, DIY videos

### 8. Challenge

"If you watch this video to the end, your coding skills will level up"

- **How it works**: Gamification — completion motivation
- **Best for**: Education, skill-building videos

### 9. Secret Reveal

"3 secrets the industry will never tell you"

- **How it works**: Desire to resolve information asymmetry
- **Best for**: Exposés, insider knowledge, expert videos

### 10. Empathy Hook

"Have you ever experienced this? [Specific situation description]"

- **How it works**: Self-identification — "This video is for me"
- **Best for**: Problem-solving, lifestyle videos

### 11. List Teaser

"I'll share 5 things, but #3 is the most important"

- **How it works**: Curiosity + structured anticipation
- **Best for**: Listicles, ranking videos

### 12. Authority Quote

"Harvard researchers tracked this for 20 years..."

- **How it works**: Trust transfer from an authority figure
- **Best for**: Science, health, education videos

### 13. Debate Starter

"Is this a genius invention or a scam?"

- **How it works**: Polarized viewpoints → desire to confirm one's own stance
- **Best for**: Reviews, trends, debate videos

### 14. Future Preview

"In 5 minutes, you'll be able to do this perfectly"

- **How it works**: Explicit expected value → return on time investment confirmed
- **Best for**: Tutorials, skill-building videos

### 15. Mistake Warning

"If you're making this mistake, stop right now"

- **How it works**: Loss aversion + self-check
- **Best for**: Tips, guides, warning videos

## Hook Combination Formula

The best hooks combine **2 patterns**:

```
[Shocking Stat] + [Secret Reveal]
→ "A fact that 92% of people don't know: 3 secrets to making money"

[Result First] + [Time Pressure]
→ "This method grew my business 3x. Watch before this information goes away"

[Empathy Hook] + [Challenge]
→ "Can't sleep because of anxiety every night? This one video will fix it"
```

## Hook–Thumbnail–Title Triangle Alignment

A hook's effectiveness is maximized within a **triangular structure**, not in isolation:

| Element            | Role                     | Alignment Rule                                                   |
| ------------------ | ------------------------ | ---------------------------------------------------------------- |
| Thumbnail          | Visual curiosity trigger | Must match the hook's emotional tone                             |
| Title              | Click driver             | A keyword-optimized version of the hook's value promise          |
| Hook (first 5 sec) | Watch-or-leave decision  | Must immediately deliver/expand on the thumbnail + title promise |

**Prohibited**: If the hook ignores the thumbnail/title promise, viewers perceive "clickbait" and retention plummets.

## Retention Rate Benchmarks

| Segment      | Target Retention | Drop-off Cause                            |
| ------------ | ---------------- | ----------------------------------------- |
| 0–5 sec      | 90%+             | No hook or excessive channel intro        |
| 5–30 sec     | 75%+             | Hook's value promise not delivered        |
| 30 sec–2 min | 65%+             | Insufficient density in the first segment |
| 2 min+       | 50%+             | No pattern interrupts                     |

## Boundaries & handoffs

Planning/drafting → calendar. Anything inbound (comments/DMs/mentions) → engagement. Hook craft questions → hook-writing (with the register consulted first). Ambiguous → is it outbound or inbound?

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"pulse\",\"skill\":\"hook-writing\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
