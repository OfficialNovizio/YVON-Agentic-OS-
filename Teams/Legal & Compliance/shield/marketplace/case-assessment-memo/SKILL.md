---
name: draft-case-assessment-memorandum
task_id: litigation-dispute-resolution/draft-case-assessment-memorandum
description: A litigation case assessment memo must evaluate each claim and defense with its evidentiary support, assess damages exposure in a reasoned range, consider insurance and venue implications, and provide a clear disposition recommendation.
activates_for: [planner, solver, checker]

type: marketplace
status: copied verbatim
source: https://github.com/HHHHHejia/awesome-legal-aiagent-skills/tree/main/litigation-dispute-resolution/draft-case-assessment-memorandum
source_raw: https://raw.githubusercontent.com/HHHHHejia/awesome-legal-aiagent-skills/main/litigation-dispute-resolution/draft-case-assessment-memorandum/SKILL.md
source_repo: HHHHHejia/awesome-legal-aiagent-skills
author: HHHHHejia (named contributor to awesome-legal-aiagent-skills)
fulfills_catalog_entry: litigation-risk-scoring / early-case-assessment (Legal & Compliance · shield · Litigation & Disputes)
assigned_agent: shield (Legal & Compliance / Litigation & Disputes)
portable: true            # no plugin-config path assumed; skill is method-only
date_added: 2026-07-29

tier: 2                    # advisory (no config-dependent bounce)
triggers:
  - case assessment
  - draft a case assessment memo
  - assess this dispute
  - assess this claim
  - early case assessment
  - claim assessment
  - damages exposure analysis
  - defense analysis
  - what's our exposure
  - how bad is this dispute
---

<!--
YVON selection rationale (playbook §4.3, §11)

Selected 2026-07-29 as shield's case-assessment marketplace skill.

Why this over alternatives:
- Purpose match to catalog's `litigation-risk-scoring` — claim-by-claim + damages
  range + disposition recommendation is exactly what early case assessment needs.
- Narrower and cleaner than `thomasmoreai/litigation-case-strategy` (30⭐) which
  covers full lifecycle (discovery + motions + appeals + trial + appellate). That
  broader skill imports scope shield doesn't need — shield is dispute registry +
  early assessment + response-deadline tracker, not full-case litigation.
- No plugin-config-path hardcode. Method-only skill. No wrapper needed.
- Explicit "failure modes the skill is correcting" section — same disclosure
  discipline the anthropics skills use.
- Structured memo output (subject / executive summary / facts / claim-by-claim /
  damages range / defenses / insurance / venue / recommendation) — feeds directly
  into shield's dispute-log for exposure tracking.

Alternative kept on shelf: `thomasmoreai/litigation-case-strategy` — adopt if
scope broadens later to include discovery / motion practice; not now.
-->

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
