<!--
Marketplace skill — copied verbatim from source (§4.6, §4.8).
Body below the frontmatter is preserved without modification.
Only frontmatter additions were made to document provenance and compile metadata.

Selection rationale:
Chosen to fulfill the catalog entry `structured-interviewing` for hire (People & Culture / Lead).
The catalog's stated purpose is "Bias-resistant interview design — Behavioral + work-sample mix,
Independent scoring before debrief, Calibrate across interviewers." This skill covers all three
directly: 4-6 competencies, behavioral + situational question bank, 1-4 scoring rubric with
level anchors, panel assignments for independent scoring, and a structured debrief template
for calibration. Sourced from Anthropic's official knowledge-work-plugins repo. §4.1 search
across skillsmp.com / mcpmarket.com / awesomeskill.ai found no cleaner fit — other candidates
were either candidate-facing (interview-preparation-assistant, prep-interview) or user-research
oriented (discovery-interview-guide, interview-mode, requirements-interviewer).

§0.4b check: source body contains zero hardcoded venture, company, or platform names —
generic content, portable as-is. `portable: true` in frontmatter.
-->
---
name: interview-prep
type: marketplace
status: copied verbatim
source: https://github.com/anthropics/knowledge-work-plugins/tree/main/human-resources/skills/interview-prep
source_author: Anthropic (knowledge-work-plugins)
source_license: Anthropic knowledge-work-plugins repo (public, MIT-compatible per repo policy — verify against upstream LICENSE at time of use)
fulfills_catalog_entry: structured-interviewing
assigned_agent: hire (People & Culture / Lead)
portable: true
date_added: 2026-07-29
tier: 2
description: Create structured interview plans with competency-based questions and scorecards. Trigger with "interview plan for", "interview questions for", "how should we interview", "scorecard for", or when the user is preparing to interview candidates.
triggers:
  - interview plan for
  - interview questions for
  - how should we interview
  - scorecard for
  - preparing to interview candidates
---

# Interview Prep

Create structured interview plans to evaluate candidates consistently and fairly.

## Interview Design Principles

1. **Structured**: Same questions for all candidates in the role
2. **Competency-based**: Map questions to specific skills and behaviors
3. **Evidence-based**: Use behavioral and situational questions
4. **Diverse panel**: Multiple perspectives reduce bias
5. **Scored**: Use rubrics, not gut feelings

## Interview Plan Components

### Role Competencies
Define 4-6 key competencies for the role (e.g., technical skills, communication, leadership, problem-solving).

### Question Bank
For each competency, provide:
- 2-3 behavioral questions ("Tell me about a time...")
- 1-2 situational questions ("How would you handle...")
- Follow-up probes

### Scorecard
Rate each competency on a consistent scale (1-4) with clear descriptions of what each level looks like.

### Debrief Template
Structured format for interviewers to share findings and make a decision.

## Output

Produce a complete interview kit: panel assignment (who interviews for what), question bank by competency, scoring rubric, and debrief template.
