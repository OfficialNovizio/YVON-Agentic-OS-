<!--
Custom skill — built from scratch, synthesized from two named published sources
(Kim Scott's Radical Candor 2017 + Sloan Weitzel's Feedback That Works via CCL 2000).
Body follows §11 required structure + §14.2 exact-heading compiler contract.

Reclassification note (2026-07-31): the catalog listed this as "feedback-methods MARKETPLACE."
§4.1 search across skillsmp.com / mcpmarket.com / awesomeskill.ai found ONE candidate
(mcpmarket's `radical-candor-feedback-framework` by lev-os) but it had 0 GitHub stars,
unclear author credentials that don't meet §8.8-adjacent standards, and covered only half
the catalog's scope (Radical Candor only, no SBI). Per §4.6 exception clause ("if it turned
into a merge of multiple sources, it's custom now"), this becomes custom — built from
Kim Scott's book + Weitzel's Feedback That Works to cover BOTH frameworks.

Same reclass path as maslow's `self-determination-theory` and grove's `deliberate-practice`.

Route classification per §8.2: Route D (cited rubric — two frameworks with clear anchors,
no formula, no script). Judgment flagged reasoning-based per §0.6 until page-cited from
Agents/_books/.

Provenance: no VYON-branded content. No genericization strip needed at the framework
level. The two frameworks are public academic/practitioner works.
-->
---
name: feedback-methods
type: custom
status: built from scratch (reclassified from catalog's marketplace slot per §4.6 exception)
sources_referenced:
  - "Scott, Kim (2017). Radical Candor: Be a Kick-Ass Boss Without Losing Your Humanity. St. Martin's Press. ISBN 978-1250103505. Practitioner-operator per §8.9 — former Google/Apple manager, coach to Silicon Valley leadership."
  - "Weitzel, Sloan R. (2000). Feedback That Works: How to Build and Deliver Your Message. Center for Creative Leadership (CCL) Press. ISBN 978-1882197583. Canonical source for the SBI (Situation-Behavior-Impact) framework. CCL is an authenticated institutional source per §8.8."
  - "radicalcandor.com — Kim Scott's public framework site with FREE materials, blog, and video resources."
  - "ccl.org — CCL's public materials on SBI and related feedback frameworks (institutional, FREE)."
  - "Scott, Kim (multiple HBR and public interviews, 2017 onward) — supplementary practitioner material."
fulfills_catalog_entry: feedback-methods (catalog listed as marketplace; reclassified per §4.6)
reclassification_notes:
  - "Catalog labeled MARKETPLACE. §4.1 search found one weak candidate (lev-os on mcpmarket, 0 stars, unclear credentials, half-scope). Reclassified to custom per §4.6."
  - "Route D per §8.2 — cited rubric, no script."
  - "Covers BOTH frameworks (SBI + Radical Candor) per catalog scope."
assigned_agent: merit (People & Culture / Performance Management)
portable: true
date_added: 2026-07-31
tier: 2
description: The SBI (Situation-Behavior-Impact) format + Kim Scott's Radical Candor stance for giving and receiving feedback. Applied at team/manager/peer level — provides frameworks for the operator to use, does NOT record individual feedback events. Trigger on "how do I give this feedback", "SBI feedback", "radical candor", "constructive criticism", "praise this well", "feedback quadrant", "care personally challenge directly", or "prepare for a hard conversation".
triggers:
  - how do I give this feedback
  - SBI feedback
  - radical candor
  - constructive criticism
  - praise this well
  - feedback quadrant
  - care personally challenge directly
  - prepare for a hard conversation
  - solicit feedback from my team
---

# Feedback Methods

## Introduction

This skill packages two well-established feedback frameworks — **SBI (Situation-Behavior-Impact)**
from CCL and Sloan Weitzel's *Feedback That Works* (2000), and **Radical Candor** from
Kim Scott's book of the same name (2017) — into one place. The two frameworks complement:
SBI is the **format** for a feedback message; Radical Candor is the **stance** for
delivering it. Together they answer both "*what* do I say" and "*how* do I show up."

Reclassified from the catalog's marketplace slot per §4.6 — the mcpmarket Radical Candor
skill by `lev-os` had 0 stars, unclear author credentials, and covered only half the
catalog's scope. Same reclass path as maslow's `self-determination-theory` and grove's
`deliberate-practice`.

**Scope constraint:** merit does NOT record individual feedback events, store per-person
feedback content, or track who-gave-whom-what-feedback. Feedback is a between-individuals
activity; merit's skill provides the FRAMEWORK the operator uses, not a surveillance layer
over their conversations. This preserves Universal Principle 7 aggregate-only rule
inherited from hire — the skill teaches; it does not observe.

## Purpose

Prevents the four failure modes that show up most often in workplace feedback:

1. **Vague evaluations** — "great job" or "you need to be more strategic" without specifics.
   SBI's Situation-Behavior-Impact structure forces concrete evidence.
2. **Ruinous Empathy** — Scott's term for caring about someone so much you don't tell them
   the truth about their performance. Feels kind; actually harmful. The Radical Candor
   framework's Care Personally × Challenge Directly grid names it explicitly.
3. **Obnoxious Aggression** — the opposite: challenging without caring. Also common;
   equally harmful. Same grid names it.
4. **One-way feedback culture** — leaders give, never solicit. Scott's rule: **solicit
   feedback BEFORE you give it.** Leaders who don't solicit don't get honest feedback
   given to them either.

merit uses this skill as the framework consumer whenever a specific feedback conversation
is being prepared — whether by the operator directly, or as part of `performance-frame`'s
quarterly review cycle, or as the delivery mechanism for `succession-planning`'s
development-plan conversations.

## When to Use

Trigger on:

- "How do I give this feedback" / "help me phrase this" / "prepare for a hard conversation"
- "SBI feedback" / "Situation Behavior Impact"
- "Radical candor" / "care personally challenge directly" / "feedback quadrant"
- "Constructive criticism" / "praise this well" / "how do I recognize this specifically"
- "Solicit feedback from my team" / "invite upward feedback" / "how do I get honest input"
- Handoff from `performance-frame` quarterly review preparation
- Handoff from `succession-planning` development-conversation preparation
- Handoff from `hiring-kit` (via hire) for SBI-structured rejection feedback to candidates

Do NOT use for:

- **Recording individual feedback events or tracking per-person feedback content.** Merit
  does not maintain a feedback log per person — that would violate Universal Principle 7.
  Feedback conversations happen between individuals; merit provides the framework, not
  the ledger.
- **Individual mental-health assessment** → HARD BOUNDARY to manager + HR Ops + EAP per
  Universal Principle 3. Feedback about a work performance concern is in-scope; a
  wellbeing concern needing professional support routes out immediately.
- **Compensation decisions** (this skill informs the delivery of comp conversations, but
  the comp band itself is `payroll-and-eor` (custom, hire) or future `comp-benchmarking`).
- **Legal action or PIP formalization** → operator + employment counsel. This skill
  supports the manager conversation; legal formalization is a separate escalation.

## Structure / Protocol

Two complementary frameworks used together:

```
FRAMEWORK 1: SBI (Situation-Behavior-Impact) — the FORMAT of the message
    Situation:  "In the customer meeting last Tuesday..."
    Behavior:   "you interrupted the customer three times when they were describing
                 their pain point..."
    Impact:     "and we walked out without a clear read on their actual priority. I
                 had to spend the next 30 min on the phone with them to reconstruct it."

    Rules: NO mind-reading ("you seemed nervous" — wrong; that's your interpretation).
           NO personality attribution ("you're a bad listener" — wrong; that's a label,
             not a behavior).
           JUST the observable Situation + observable Behavior + factual Impact.

FRAMEWORK 2: Radical Candor — the STANCE
    Two dimensions:
      Y-axis: Care Personally  (about the person as a whole human, not just their output)
      X-axis: Challenge Directly (say the hard thing, kindly, clearly, specifically)

    Four quadrants (Scott):
      + Care, + Challenge  = RADICAL CANDOR       (the goal)
      + Care, - Challenge  = RUINOUS EMPATHY      (nice, useless, harmful)
      - Care, + Challenge  = OBNOXIOUS AGGRESSION (harsh, effective short-term, corrosive)
      - Care, - Challenge  = MANIPULATIVE INSINCERITY (toxic; passive-aggressive)

    Order of operations (Scott):
      1. SOLICIT feedback first (from your team, upward). Leaders who don't solicit
         don't get honest feedback given to them.
      2. GIVE specific praise (SBI format for what worked).
      3. GIVE specific criticism (SBI format for what didn't work — kind AND clear).

Combined: use SBI FORMAT to deliver a message from the RADICAL CANDOR STANCE.
```

## Instructions

### Phase 1 — Diagnose which quadrant you're currently in (Scott)

Before giving the feedback, check where the *current pattern* of your feedback to this
person sits on Scott's grid:

- **If your recent feedback has been mostly praise, no criticism** → Ruinous Empathy risk.
  The specific criticism you're about to give will feel abrupt. Prepare for that.
- **If your recent feedback has been mostly criticism, little praise or personal
  connection** → Obnoxious Aggression risk. The person may hear this as another attack.
  Consider what caring evidence exists in your history with them and consider surfacing it.
- **If your recent feedback has been silence** → both dimensions are missing. This is
  worse than either extreme. The specific message is important but the underlying pattern
  needs a separate reset.
- **If your recent feedback has been in the Radical Candor quadrant** → proceed with SBI
  delivery below.

### Phase 2 — Build the SBI message (Weitzel / CCL)

Draft the specific message in SBI format:

1. **Situation** — When and where did this happen? Be specific enough that the person
   can bring the moment back to mind. "In the retrospective last Thursday" beats "in a
   recent meeting."
2. **Behavior** — What did they actually do (or say)? Observable, no mind-reading, no
   personality attribution. "You interrupted the customer three times" beats "you seemed
   impatient."
3. **Impact** — What happened as a consequence? Factual impact on the work, the team, or
   the customer. "We walked out without a clear read on their priority" beats "it was
   frustrating."

**Anti-pattern check:**
- "You always..." → not an observation, it's a summary. Replace with a specific instance.
- "You seemed..." → not a behavior, it's your read. Replace with what they said or did.
- "You're..." → not a behavior, it's a personality label. Replace with an action.

### Phase 3 — Solicit BEFORE giving (Scott's order of operations)

Especially for managers giving downward feedback: before delivering the SBI message, take
a moment to solicit feedback on *yourself* first. "Is there anything I could be doing
differently that would help you?" This isn't performative — it establishes the two-way
norm that makes the downward feedback land.

For peer feedback, this step is optional but often useful — "how would you approach the
same situation from my seat?" shifts the frame from evaluation to mutual learning.

### Phase 4 — Deliver, then pause

Deliver the SBI message. Then **stop talking.** The instinct is to fill silence with
softening, hedging, or re-explaining. Don't. Let the other person respond.

**Anti-pattern check:**
- Softening after ("...but overall you're doing great") — undermines the message.
- Explaining why they might have done it that way — takes their voice out of the
  conversation.
- Adding a second piece of criticism — feedback sandwich pattern; muddies both messages.

### Phase 5 — Confirm understanding and next action

- "What's your read on what happened?" — invites their perspective without leading.
- "What would you do differently next time?" — puts the response in their hands, not
  yours.
- If a specific behavior change is expected: state it as a request, not a demand, and
  confirm a follow-up moment ("let's talk again after next week's meeting").

### Phase 6 — For praise: same discipline, opposite direction

Praise gets the same SBI structure. Vague praise ("great job") is as weak as vague
criticism. Specific praise ("in the retro yesterday, when the customer said X and you
responded Y, that unblocked the whole conversation — that's the pattern we want more of")
reinforces the specific behavior, which is what makes praise motivating rather than
generic.

## Output Format

Each invocation produces one or more of:

- **SBI feedback script** — for a specific conversation the operator is preparing for.
  Includes the Situation / Behavior / Impact draft with anti-pattern checks applied.
- **Feedback quadrant diagnostic** — Scott's grid applied to the operator's recent
  feedback pattern with this person. Names the current quadrant and the shift needed.
- **Solicit-first script** — for managers preparing to give downward feedback; a
  brief 1-2 sentence solicit-upward opener.
- **Delivery-and-pause plan** — the moment-by-moment structure: SBI → pause → invite
  their read → confirm next action. With explicit anti-patterns to avoid.
- **Praise-with-specificity draft** — for reinforcing observed positive behavior in the
  same SBI structure.

Never a persistent record of the feedback event itself — that would violate scope per
Purpose failure mode extension.

## Principles

1. **SBI is the format; Radical Candor is the stance.** They complement, not compete.
   Delivering a Radical Candor message in vague not-SBI form leaves the person guessing
   what to change. Delivering an SBI message from Obnoxious Aggression makes it land
   as an attack, not information.
2. **No mind-reading. No personality attribution.** SBI's discipline is observability.
   "You seemed" is not observable. "You're a" is not a behavior. Replace both.
3. **Solicit before you give.** Managers who don't solicit upward feedback don't get
   honest feedback given to them. This isn't a nice-to-have; it's what makes the whole
   framework work. (Scott, throughout.)
4. **Deliver, then pause.** Don't soften. Don't sandwich. Don't fill silence with
   re-explanation. Let the other person respond.
5. **Merit does not observe or record individual feedback events.** This skill teaches
   the framework; it does not build a feedback ledger per person. Universal Principle 7
   aggregate-only applies at merit's data-holding surface.
6. **Care Personally is not a technique to fake.** Scott is clear: the framework depends
   on genuine care for the person as a whole human. Performative care shows through, and
   the feedback then reads as manipulative even when the format is perfect.
7. **Individual mental-health signals escalate immediately.** Feedback about work
   performance is in-scope. Distress signals about the person's wellbeing route to
   manager + HR Ops + EAP per Universal Principle 3 — HARD BOUNDARY, no exceptions.
8. **§0.6 flag.** Both frameworks are well-established but the specific applications
   (5-phase delivery structure; solicit-first ordering; anti-pattern list) are Tier B
   (canonical published frameworks cited but not page-cited from `Agents/_books/`).
   Downgrade to Tier A when Scott 2017 + Weitzel 2000 are placed and a
   `Shared OS/logical/feedback_methods.md` Route-D asset with page citations is built
   per §8.9.

## Fallback

- **Request to draft feedback based on hearsay** ("someone told me X did Y"). Push back —
  SBI's Situation must be something the giver personally observed, not third-hand. Ask
  the operator to observe directly or to give the feedback about the observed pattern
  (a manager can legitimately give feedback about a pattern surfacing in team output
  even if they didn't witness a specific instance).
- **Request to draft feedback that's actually a performance-review formalization**
  (PIP-adjacent) → route to future `performance-frame` for the review-cycle context and
  operator + employment counsel for the PIP formalization. This skill supports the manager
  conversation; formal PIP is a separate legal-adjacent process.
- **Request to draft feedback that would legally compromise the operator** (e.g.,
  discriminatory phrasing surfaces during drafting) → decline the specific phrasing and
  escalate to operator + employment counsel. Do NOT produce the compromised draft.
- **Individual mental-health signal surfaces during the feedback preparation** (the
  target person is described as in distress, or the feedback content is about the
  operator's own distress). STOP. Route per Universal Principle 3 to manager + HR Ops +
  EAP. No feedback drafting continues.
- **Operator asks for a "feedback sandwich" (praise-criticism-praise)** — push back per
  Scott's finding. Sandwich pattern muddies both messages. Praise and criticism land
  better as separate conversations or at minimum with a clear pause between them.
- **Ambiguity about whether the message is praise or criticism.** Ask the operator to
  decide before drafting. A message that hedges between "you did great" and "here's what
  I'd change" produces confusion, not clarity.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `performance-frame` (custom, merit — sibling) | Quarterly-review conversations use SBI + Radical Candor delivery | Upstream — performance-frame calls this skill for the delivery mechanism of review content |
| `succession-planning` (custom, merit — sibling) | Development-plan conversations with succession candidates | Upstream — succession-planning identifies the growth areas; this skill delivers the conversation |
| `hr-strategy-alignment` (custom, merit — sibling) | Framing "why this feedback matters" against the org's stated business objectives | Cross-cutting when the feedback lands in a strategic-priority scope |
| `hiring-kit` (custom, hire) | SBI-structured rejection feedback to candidates (Phase 4 and Phase 6 rejects) | Downstream — hire's hiring-kit routes rejection-feedback delivery here |
| `motivation-map` (custom, maslow) | Phase-5 relatedness intervention → some interventions require a feedback conversation | Downstream — motivation-map may route here as part of the relatedness fix |
| `training-program-design` (custom, grove) | Formal-instruction 10% piece of a manager-training program may include SBI + Radical Candor as content | Upstream — this skill is the source for that content |
| `hire` (P&C Lead) | Universal principle inheritance (aggregate-only, verification-before-completion, Charter senior, individual-crisis HARD BOUNDARY) | Upstream principles |
| Future `comp-benchmarking` skill | Compensation-conversation delivery (comp band decided elsewhere; this skill supports the conversation about it) | Downstream — comp is external; delivery is this skill |
| Manager + HR Ops + EAP | Individual mental-health signals during feedback prep or delivery — HARD BOUNDARY | Escalation only — Universal Principle 3 |
| Operator + employment counsel | PIP formalization; discriminatory-phrasing concerns; legal-adjacent feedback | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate on every feedback draft before it ships | Cross-cutting |

## References (public / verifiable)

- [Radical Candor — Kim Scott's public framework site](https://www.radicalcandor.com/)
- [Radical Candor — Our Approach: Kim Scott's Feedback Framework](https://www.radicalcandor.com/our-approach)
- [Radical Candor — Resources For Feedback Training, Coaching & Development](https://www.radicalcandor.com/resources)
- [Center for Creative Leadership — home; SBI framework materials](https://www.ccl.org/)
- [The Art of Radical Candor — HubSpot UNBOUND article](https://unbound.hubspot.com/blog/the-art-of-radical-candor)
- [Radical Candor for Effective Communication in the Workplace — Management 3.0](https://management30.com/blog/radical-candor/)
- [Radical Candor Framework: Build a Feedback Culture — Kithindin](https://kithindin.com/radical-candor/)
- [Feedback and the skill of radical candor — Amazing If podcast episode PDF](https://www.amazingif.com/wp-content/uploads/2021/05/211_Feedback-and-the-skill-of-radical-candor_PodSheets.pdf)
