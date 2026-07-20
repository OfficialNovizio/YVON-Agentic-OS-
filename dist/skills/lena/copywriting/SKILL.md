---
name: copywriting
agent: lena
department: Brand Studio
version: 1.1.0
tier: 2
description: |
  **Required:** None — Copywriting is a knowledge-based skill with no external dependencies. (yvon)
triggers:
  - copywriting
  - tired of slow builds?
  - every second wasted costs $x
  - introducing [product]
  - our product is great
  - cut build time by 73% in 48 hours
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/lena/marketplace/copywriting/SKILL.md
  source_hash: 6708e89ed770a1d507ffd6f08bb6e0341683863753a55864963867cfcc581118
  generated: 2026-07-20T03:20:23.623Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/lena/marketplace/copywriting/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js lena -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: lena — Brand Studio · skill: copywriting"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"lena\",\"skill\":\"copywriting\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "copywriting", "tired of slow builds?", "every second wasted costs $x", "introducing [product]", "our product is great", "cut build time by 73% in 48 hours".

## Purpose

**Required:** None — Copywriting is a knowledge-based skill with no external dependencies.

## Copywriting — Conversion Formulas
> 6 proven formulas. Benefit-first. Specific claims. One CTA per piece.
---

### 5 Must-Ask Questions (Socratic Gate)

| # | Question            | Options                           |
| --- | ------------------- | --------------------------------- |
| 1 | Target Audience?    | Demographics / Pain points / Role |
| 2 | Core Product Value? | Primary benefit / USP             |
| 3 | Content Type?       | Landing / Email / Ad / Headline   |
| 4 | Primary CTA?        | Buy / Sign Up / Read More         |
| 5 | Brand Tone?         | Professional / Casual / Urgent    |

---

### Prerequisites

**Required:** None — Copywriting is a knowledge-based skill with no external dependencies.

---

### When to Use

| Content Type               | Formula  | Steps                                     |
| -------------------------- | -------- | ----------------------------------------- |
| Landing pages, ads         | **AIDA** | Attention → Interest → Desire → Action    |
| Email, sales pages         | **PAS**  | Problem → Agitate → Solution              |
| Testimonials, case studies | **BAB**  | Before → After → Bridge                   |
| Long-form sales            | **4Ps**  | Promise → Picture → Proof → Push          |
| Headlines                  | **4Us**  | Urgent + Unique + Useful + Ultra-specific |
| Product descriptions       | **FAB**  | Feature → Advantage → Benefit             |

**Selection is deterministic:** same content type = same formula, every time.

---

### System Boundaries

| Owned by This Skill                | NOT Owned                              |
| ---------------------------------- | -------------------------------------- |
| Formula selection per content type | SEO keyword research (→ seo-optimizer) |
| Headline validation (4Us)          | Visual design (→ studio)               |
| Copy validation (5 rules)          | A/B test infrastructure                |
| Anti-pattern detection             | Image generation for ads (→ ai-artist) |

**Pure decision skill:** Produces formula frameworks and validation. Zero side effects.

---

### Copy Formulas

#### AIDA (Landing Pages, Ads)

| Step          | Purpose         | Guidance                           |
| ------------- | --------------- | ---------------------------------- |
| **A**ttention | Grab interest   | Bold headline with specific number |
| **I**nterest  | Build curiosity | Key benefit statement              |
| **D**esire    | Create want     | Social proof, testimonials         |
| **A**ction    | Drive CTA       | Single, clear next step            |

#### PAS (Email, Sales Pages)

| Step         | Purpose        | Guidance                       |
| ------------ | -------------- | ------------------------------ |
| **P**roblem  | Name the pain  | "Tired of slow builds?"        |
| **A**gitate  | Intensify pain | "Every second wasted costs $X" |
| **S**olution | Present fix    | "Introducing [Product]"        |

#### BAB (Case Studies)

| Step       | Purpose                        |
| ---------- | ------------------------------ |
| **B**efore | Current painful state          |
| **A**fter  | Desired outcome with specifics |
| **B**ridge | Your solution connects them    |

#### FAB (Product Descriptions)

| Step          | Focus                 |
| ------------- | --------------------- |
| **F**eature   | What it is            |
| **A**dvantage | Why it matters        |
| **B**enefit   | How it helps the user |

---

### Headline Validation (4Us)

| Dimension          | Question            | Pass/Fail |
| ------------------ | ------------------- | --------- |
| **U**rgent         | Why act now?        | Binary    |
| **U**nique         | What's different?   | Binary    |
| **U**seful         | What's the benefit? | Binary    |
| **U**ltra-specific | What exactly?       | Binary    |

```
❌ "Our Product is Great"           → 0/4 Us
✅ "Cut Build Time by 73% in 48 Hours" → 4/4 Us
```

---

### Copy Validation Rules (5 Rules)

| # | Rule            | Check                                       |
| --- | --------------- | ------------------------------------------- |
| 1 | Benefit-first   | Benefits precede features                   |
| 2 | Single CTA      | One call-to-action per piece                |
| 3 | Specific claims | Numbers, percentages, or concrete outcomes  |
| 4 | No jargon       | Conversational tone over corporate language |
| 5 | Read-aloud test | No awkward phrasing when spoken             |

---

### Error Taxonomy

| Code                       | Recoverable | Trigger                            |
| -------------------------- | ----------- | ---------------------------------- |
| `ERR_INVALID_REQUEST_TYPE` | No          | Request type not supported         |
| `ERR_MISSING_CONTENT_TYPE` | Yes         | Content type not provided          |
| `ERR_UNKNOWN_CONTENT_TYPE` | No          | Content type not in supported list |
| `ERR_MISSING_DRAFT`        | Yes         | Draft required for validation      |
| `ERR_EMPTY_DRAFT`          | Yes         | Draft is empty                     |

**Zero internal retries.** Deterministic; same inputs = same output.

---

### Anti-Patterns

| ❌ Don't                 | ✅ Do                            |
| ----------------------- | ------------------------------- |
| Features first          | Benefits first                  |
| Multiple CTAs           | One clear action                |
| Vague claims ("faster") | Specific numbers ("73% faster") |
| Corporate jargon        | Conversational tone             |

---

### Audit Logging (OpenTelemetry)

| Event               | Metadata Payload                                 | Severity |
| ------------------- | ------------------------------------------------ | -------- |
| `formula_selected`  | `{"formula": "PAS", "content_type": "email"}`    | `INFO`   |
| `validation_passed` | `{"content_type": "headline", "score": "4/4"}`   | `INFO`   |
| `violations_found`  | `{"rule": "benefit-first", "severity": "error"}` | `WARN`   |

All copywriting outputs MUST emit `formula_selected`, `validation_passed`, or `violations_found` events when applicable.

---

### 📁 Content Map

| File                                             | Description                                             | When to Read        |
| ------------------------------------------------ | ------------------------------------------------------- | ------------------- |
| engineering-spec.md (source repo `rules/`)        | Full engineering spec: contracts, security, scalability | Architecture review |

---

### 🔗 Related

| Item            | Type  | Purpose                     |
| --------------- | ----- | --------------------------- |
| `seo-optimizer` | Skill | SEO-friendly copy structure |
| `studio`        | Skill | Design + copy integration   |
| `ai-artist`     | Skill | Image generation for ads    |

---

⚡ PikaKit v3.9.206

## Boundaries & handoffs

- **copywriting → nate**: conversion variants (the catalog's "draft 3 variants") hand to nate for testing; lena writes, nate measures.

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"lena\",\"skill\":\"copywriting\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
