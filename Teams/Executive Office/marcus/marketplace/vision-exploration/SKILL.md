---
name: vision-exploration
source: https://skillsmp.com/creators/yunshu0909/yunshu_skillshub/vision-exploration
source_repo: https://github.com/yunshu0909/yunshu_skillshub/tree/master/vision-exploration
author: yunshu0909
original_language: Chinese
translated_to: English (2026-07-02, faithful translation, no content cut)
fulfills_catalog_entry: vision (VYON_Skills_Catalog_Full_v2.html, marcus/Executive Office)
assigned_agent: marcus (Executive Office / Orchestrator)
date_added: 2026-07-02
# yvon-compile metadata (additive — body remains verbatim per marketplace convention)
tier: 2
description: "Articulates a long-horizon end-state vision and narrative before goals exist — the upstream input okr-cascade cascades from"
triggers: [vision exploration, long-term vision, end-state vision, where should this be in five years]
---

<!--
  This file is a faithful English translation of the "vision-exploration" SKILL.md from the
  source above, selected to fulfill the catalog's "vision" skill slot for marcus after research
  found no marketplace skill under the literal name "vision" that matched the catalog's intent
  (long-horizon vision articulation and narrative framing) — the only name match found was an
  unrelated image/OCR analysis skill. This is the closest real, sourced skill matching that intent.
  NOTE FOR REVIEW: the source skill is framed around exploring end-states for a *product feature/
  module*, producing HTML mockups. It may need adaptation to be used for company-level/venture-level
  vision articulation at the Executive Office level rather than product vision. Flagging for
  discussion rather than altering the copied source.
-->

## End-State Vision Exploration

The user has a vague idea or an existing feature/module and wants to see what it could evolve into. The AI leads the entire process, starting from the essence of value, to help the user see multiple radically different end-state possibilities. No limits, no convergence — pure divergence.

**Difference from design-exploration:**

- design-exploration: from vague → converges to an actionable design plan (outputs a PRD-level document)
- vision-exploration: from vague → diverges to the farthest possibilities (outputs end-state vision HTML)

### First Principles

The following principles outrank all process rules. When any step conflicts with them, these principles win:

1. **Quality first, cost doesn't matter** — don't spare tokens, don't rush. Better to spend 3x the tokens on one stunning proposal than to economize into a mediocre one. Every output must be polished enough to show directly to investors.
2. **Create proactively, don't just relay** — the AI doesn't simply do whatever the user says. It must think proactively, ask proactively, and proactively surface possibilities the user hadn't considered. The user gives a seed; the AI grows a tree.
3. **Think deeply, don't skim the surface** — truly think each step through. When probing value, dig down to the level of "the user fundamentally doesn't want to do the thing they're describing, they need something behind it." When deriving the evolution path, push to "why each step naturally happens." When drawing the end-state, push to "this is a completely different form."
4. **Never impose limits** — don't consider "can this be built right now," "is it technically hard," or "how long would it take." This process cares about exactly one thing: how far it can go. Any form of "this might not be achievable" is off-limits during exploration.
5. **Explore fully, don't rush to converge** — better to produce a few extra options for the user to choose from than to lock in a direction too early. "Waste" during the exploration phase is investment, not cost.

### Core Principles

- **AI leads, the human only needs to express** — the user just throws out an idea; the AI is responsible for probing, guiding, deriving, and producing the visuals. The user doesn't need to have it figured out — figuring it out is the AI's job.
- **Ask why first, draw what it looks like last** — value → motivation → path → form; the order must not be scrambled.
- **End-states must differ across dimensions** — not the same thing rearranged, but genuinely different forms and information architectures.
- **Every step needs user confirmation before proceeding** — the AI guides but doesn't dictate; at every key node, let the user see and confirm.

### Workflow

#### Step 1: Probe the Essence of Value

After the user states an idea, don't rush ahead. First probe all the way down.

**Core question:** What problem does this actually solve?

Method:
1. First restate the user's idea to confirm understanding is accurate.
2. Ask "why" — why does the user need this? What's the real need behind the surface request?
3. If one layer isn't enough, dig another — until you find the essence of "the user fundamentally doesn't want to do this, but has no choice."

Example:
- Surface: "I want to build an API-switching page."
- One layer deeper: "Why switch?" → save money, quota reached, trying something new, outage.
- Another layer: "The user doesn't actually want to switch — switching is a last resort. The real need is 'help me manage my AI resources well.'"

**Output:** a one-sentence value positioning (e.g., "this module's value isn't switching, it's AI resource management").

**Forbidden:** jumping to visuals after one sentence from the user. Value essence must be excavated first.

#### Step 2: Dig Out Real User Motivations

Value positioning is abstract — it needs to be grounded in concrete user motivations.

**Core question:** Under what circumstances would a user come to use this?

Method:
1. Ask the user directly: what's the most common scenario in which you'd use this feature?
2. Use AskUserQuestion to offer options, allow multi-select, and allow free-text additions.
3. Organize the user's answers into a structured list of motivations.

**Output:** a list of user motivations (e.g., save money, quota exhausted, try a new model, failover, task matching, budget control).

**Forbidden:** the AI guessing motivations on its own. They must be drawn out from the user directly.

#### Step 3: Derive the Natural Evolution Path

Based on the value essence and user motivations, derive the evolution chain from simplest to end-state.

**Core question:** Starting from the minimum viable version, what does each step naturally grow into?

Method:
1. Find the minimal starting point — what's the user's most basic need right now?
2. Starting from each user motivation, ask "after this step is done, what would the user naturally want next?"
3. Push forward step by step until the end-state form emerges.
4. Every step must solve a real problem — it can't be "a feature for feature's sake."

Characteristics of a valid evolution path:
- Each step is a natural extension of the previous one.
- Each step has a clear "because the user hit problem X, they need Y."
- It's not a blueprint designed upfront — it's something that grows organically through use.

**Output:** an evolution chain (e.g., manual switching → informed switching → proactive system alerts → intelligent auto-management).

Show this chain to the user, confirm the logic holds, then proceed.

**Forbidden:** skipping this step and jumping straight to the end-state. Without an evolution path, the end-state is castles in the air.

#### Step 4: Draw the End-State Forms

Based on the endpoint of the evolution path, output multiple end-state visions across radically different dimensions.

**Core question:** What might the end-state look like? What entirely different possibilities exist?

Method:
1. First decide how many dimensions to explore — typically 4-6.
2. Each dimension must represent a distinct information architecture and interaction paradigm, not a layout variant of the same thing.
3. Produce one design artifact per dimension.

Criteria for judging dimensional difference:
- ❌ "List vs. grid vs. table" — this is a layout variant, not a different dimension.
- ✅ "Event stream vs. conversational vs. minimal state vs. timeline vs. modular cards" — this is a different information architecture.

Requirements for each end-state artifact:
- Single file, self-contained (inline CSS, no external dependencies) when produced as HTML.
- Use the project's design system if one exists; read it first.
- Fill with real data, not placeholders.
- Visually polished, to a "can be shown directly to people" standard.
- No restriction on frame style — use a specified frame convention if the user specified one; otherwise ask the user's preference, or use whichever presentation best suits the proposal.
- No restriction on size — decide the best scale based on the content and the proposal's characteristics.
- Don't economize on length or detail to save effort — never lower quality to save output volume.

**Output:**
- 4-6 end-state artifacts (HTML or equivalent).
- A comparison table explaining each proposal's core concept and dimensional differences.

**Forbidden:**
- Producing only 1-2 proposals.
- Proposals that differ too little from each other (same idea, different wrapper).
- Proposals with only text descriptions and no visual artifact.

#### Step 5: Summarize and Archive

Once the user has reviewed all proposals, compile the results of this exploration:

1. Evolution path diagram — the complete chain from starting point to end-state.
2. End-state proposal comparison — each proposal's core concept, applicable scenarios, information architecture differences.
3. User preference — which directions resonated with the user (if stated).

Archive files under a topic-named directory (e.g. `design/{exploration-topic}/`). Confirm the directory and file names with the user.

### Communication Norms During the Process

**AI-led pacing.** This process is the AI guiding the user, not the user directing the AI. The AI must:

1. Proactively advance each step, without waiting for the user to ask "what's next?"
2. Get user confirmation on every key conclusion before proceeding.
3. When the user speaks vaguely, take responsibility for structuring it and probing further.
4. If the user drifts off track (e.g., focusing on details too early), pull them back.

**Must ask the user:**

| Step | What to ask |
|---|---|
| Step 1 | "Did I understand you correctly?" + probe value |
| Step 2 | "What scenario do you use this feature in?" |
| Step 3 | "Does this evolution logic hold up?" |
| Step 4 | "Which direction resonates with you?" |
| Step 5 | Archive directory name and file name |

**No need to ask the user:**

| Item | Just do it |
|---|---|
| How to pick dimensions | AI judges on its own, ensuring differentiation |
| How to design the artifacts | AI designs on its own, ensuring quality |
| How to derive the evolution path | AI derives on its own, then shows to user for confirmation |

**What the AI must never do:**

- Start drawing the end-state the moment the user states an idea (skipping value-probing and motivation-digging).
- Produce a pile of layout variants as if they were "different proposals" (no dimensional difference).
- Consider "is this technically feasible" during the exploration phase (this is imposing limits).
- Decide on the user's behalf which proposal is best (the AI only presents possibilities; the user chooses).
- Draw the end-state directly without an evolution path (the end-state has no foundation).
