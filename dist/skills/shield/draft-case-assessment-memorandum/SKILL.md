---
name: draft-case-assessment-memorandum
agent: shield
department: Legal & Compliance
version: 1.0.0
tier: 2
description: |
  A litigation case assessment memo must evaluate each claim and defense with its evidentiary support, assess damages exposure in a reasoned range, consider insurance and venue implications, and provide a clear disposition recommendation. (yvon)
triggers:
  - draft case assessment memorandum
allowed-tools:
  - <FILL_IN: not listed in shield-tool-requirements.md>
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Legal & Compliance/shield/marketplace/case-assessment-memo/SKILL.md
  source_hash: b5518c709434a098f32dab8b0707b5b138335214b0ea2b2e14c9a5a202c7dcbf
  generated: 2026-08-06T05:54:55.455Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Legal & Compliance/shield/marketplace/case-assessment-memo/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js shield -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: shield — Legal & Compliance · skill: draft-case-assessment-memorandum"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"shield\",\"skill\":\"draft-case-assessment-memorandum\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "draft case assessment memorandum".

## Purpose

- Treat the complaint, distribution agreement, correspondence, internal emails, damages report, and related documents as a single integrated record.
- Identify the governing agreement, the asserted causes of action, the operative termination/performance provisions, and the forum and governing-law provisions before analysis.
- If the record contains multiple claims, defenses, periods of alleged breach, or damages theories, enumerate them first and analyze each separately.
- If only one claim, one damages theory, or one governing-law regime is actually in scope, say so explicitly and explain why.

## Protocol

# Skill: Draft Case Assessment Memorandum — Litigation Risk Analysis for Distribution Agreement Dispute

## 1. Subject-matter triage

- Treat the complaint, distribution agreement, correspondence, internal emails, damages report, and related documents as a single integrated record.
- Identify the governing agreement, the asserted causes of action, the operative termination/performance provisions, and the forum and governing-law provisions before analysis.
- If the record contains multiple claims, defenses, periods of alleged breach, or damages theories, enumerate them first and analyze each separately.
- If only one claim, one damages theory, or one governing-law regime is actually in scope, say so explicitly and explain why.

## 2. Failure modes the skill is correcting

- Analyzing claims in the abstract without tethering each element to specific facts in the source documents
- Treating the plaintiff’s damages demand as the endpoint instead of independently testing the support, assumptions, offsets, and contract limits
- Ignoring insurance and coverage issues that materially affect net exposure and settlement posture
- Failing to address venue, forum, and procedural posture as part of the practical risk picture
- Concluding with a narrative summary only, instead of a concrete disposition recommendation and action plan
- Stating legal conclusions without identifying the controlling rule, statute, or case that supports them
- Collapsing distinct claims, defenses, accrual dates, or damages theories into one blended analysis

## 3. Legal frameworks / domain conventions that apply

- Structure the memo in standard litigation-assessment order: facts, claims, defenses, damages, insurance/coverage, venue, and recommendation.
- For each claim, apply the governing elements under the relevant common law, statute, or contract doctrine, and test each element against the developed record.
- For breach of contract, address contract formation, performance, breach, causation, and damages under the governing law identified in the materials or otherwise applicable.
- For fraud or misrepresentation theories, analyze the heightened pleading and proof requirements, justifiable reliance, scienter, causation, and any remedies distinctions.
- For termination-related disputes, focus on contractual notice, cure, cause versus convenience, exclusivity, performance standards, and any discretionary rights or limitations.
- For limitations defenses, identify the accrual rule, any tolling or discovery doctrines, and how the timeline in the documents affects each claim.
- For punitive or enhanced damages, identify the governing standard and assess whether the pleaded facts plausibly meet it.
- For insurance issues, examine potentially responsive coverage, exclusions, retentions, conditions, and reservation-of-rights issues that affect practical recovery or funding.
- Cite the controlling authority for each legal proposition by name and section, rule, or case when the proposition is relied on.

## 4. Analytical scaffolds

- Start from the complaint and agreement, then map each asserted claim to the specific contractual language and event timeline.
- For every claim, apply a consistent sequence: legal standard, supporting evidence, adverse evidence, risk assessment, and net litigation consequence.
- Break damages into distinct categories reflected in the record, then test each category against contract language, causation, mitigation, offsets, and admissible proof.
- Use internal emails and correspondence to identify admissions, credibility issues, notice defects, intent, knowledge, and contemporaneous business understanding.
- Assess each affirmative defense on its own facts and legal footing, rather than listing defenses generically.
- When more than one party, period, or theory is implicated, run the same analytic frame for each item and keep the conclusions separate.
- Where the record permits a range rather than a single number, present a reasoned exposure range grounded in the documents and governing law, not a raw plaintiff ask.
- If a factual assertion depends on an internal document, quote or paraphrase only what is necessary and stay within the anti-leakage limits.

## 5. Vertical / structural / temporal relationships

- Track the chronology of notice, alleged breach, cure periods, termination, post-termination conduct, and litigation milestones.
- Compare the agreement’s operative provisions against later correspondence, operational conduct, and any damages assumptions that depend on those provisions.
- Note interactions among claims that may share the same event, the same damages base, or the same limitations problem.
- Distinguish between pre-termination and post-termination conduct where liability, causation, or damages differ.
- If the same document affects both liability and damages, explain both effects without merging the analyses.
- Where venue or forum provisions interact with enforcement or tactical posture, state the practical consequence for the client.

## 6. Output structure conventions

- Use a conventional memorandum format with a clear subject line, date if available, and concise issue framing.
- Begin with an executive summary that states the bottom-line risk view and recommendation.
- Follow with factual background, then claim-by-claim analysis, then damages, defenses, insurance/coverage, venue, and strategic considerations.
- For each claim section, include: governing standard, plaintiff-supporting facts, defense facts, and risk assessment.
- Present damages in a reasoned range with categories, assumptions, and any contractual or legal constraints.
- Include a distinct defense section that addresses the strongest affirmative defenses and their likely effect on outcome.
- Include an insurance and coverage section that addresses potential funding sources and coverage obstacles.
- Include a venue and forum section that addresses likely litigation consequences, not just doctrine.
- End with a recommended disposition and an action-oriented next steps section.
- Frame recommendations in the imperative, assign them to an appropriate responsible role where identifiable, and tie them to a timing anchor or litigation milestone.
- Do not let the memo drift into bare issue spotting; every issue should end in a consequence for exposure, leverage, or disposition.

## Output format



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"shield\",\"skill\":\"draft-case-assessment-memorandum\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
