<!--
Marketplace skill — copied verbatim from source (§4.6, §4.8).
Body below the frontmatter is preserved without modification.
Only frontmatter additions were made to document provenance and compile metadata.

Selection rationale:
Chosen to fulfill the catalog entry `internal-comms-practice` for signal (Comms & PR /
Internal Comms). §4.1 search found Anthropic's official internal-comms skill in the
anthropics/skills repo (165.1k stars on parent repo) — HIGHEST-credibility candidate,
cleanly matches signal's scope for internal-comms formats (3P updates, company
newsletters, FAQs, general internal comms). Same author + license pattern as hire's
`interview-prep` marketplace skill.

§0.4b check: source body contains zero hardcoded venture, company, or platform names —
generic content, portable as-is. `portable: true` in frontmatter.

Assets: 4 example files (examples/3p-updates.md, examples/company-newsletter.md,
examples/faq-answers.md, examples/general-comms.md) also copied verbatim from source
into examples/ subfolder alongside this SKILL.md.
-->
---
name: internal-comms
type: marketplace
status: copied verbatim
source: https://github.com/anthropics/skills/tree/main/skills/internal-comms
source_author: Anthropic (github.com/anthropics/skills — 165.1k stars on parent repo)
source_license: "Complete terms in LICENSE.txt at source repo — Anthropic official skill license"
fulfills_catalog_entry: internal-comms-practice
assigned_agent: signal (Comms & PR / Internal Comms)
portable: true
date_added: 2026-07-31
tier: 2
description: A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.).
license: Complete terms in LICENSE.txt
triggers:
  - 3P updates
  - company newsletter
  - company comms
  - weekly update
  - faqs
  - common questions
  - updates
  - internal comms
  - status report
  - leadership update
  - project update
  - incident report
---

## When to use this skill
To write internal communications, use this skill for:
- 3P updates (Progress, Plans, Problems)
- Company newsletters
- FAQ responses
- Status reports
- Leadership updates
- Project updates
- Incident reports

## How to use this skill

To write any internal communication:

1. **Identify the communication type** from the request
2. **Load the appropriate guideline file** from the `examples/` directory:
    - `examples/3p-updates.md` - For Progress/Plans/Problems team updates
    - `examples/company-newsletter.md` - For company-wide newsletters
    - `examples/faq-answers.md` - For answering frequently asked questions
    - `examples/general-comms.md` - For anything else that doesn't explicitly match one of the above
3. **Follow the specific instructions** in that file for formatting, tone, and content gathering

If the communication type doesn't match any existing guideline, ask for clarification or more context about the desired format.

## Keywords
3P updates, company newsletter, company comms, weekly update, faqs, common questions, updates, internal comms
