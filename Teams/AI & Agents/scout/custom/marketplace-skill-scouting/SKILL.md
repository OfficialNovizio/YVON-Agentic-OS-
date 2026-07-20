---
name: marketplace-skill-scouting
type: custom
status: built from scratch
fulfills_catalog_entry: none — makes the playbook's marketplace-first rule (§3–4) a standing agent job (redesign plan §3)
assigned_agent: scout (AI & Agents / Tool & Ecosystem Scanner)
portable: true
date_added: 2026-07-10
---

# Marketplace Skill Scouting

## Introduction
The playbook's marketplace-first search, made a standing job: for any skill need in any department, search real skill marketplaces by PURPOSE before anyone builds custom, and present candidates with sources. **The human approval step is unchanged (operator decision 2026-07-10): scout shortlists, the operator approves.**

## Purpose
Real, sourced skills are cheaper to verify than custom builds — but only if someone actually searches well. This skill is that search, done the same way every time.

## When to Use
- A department/agent build starts (pre-build pass — playbook §3).
- A custom skill's frontmatter carries a queued marketplace candidate (`PENDING` notes — e.g. gauge's llm-ops-basics, relay's integration-patterns).
- Any "is there a real skill for X?" question.

## Structure / Protocol
PURPOSE (restate the need as a problem, not the catalog's aspirational name — playbook 4.1) → SEARCH (skillsmp.com, mcpmarket.com, awesomeskill.ai, github `<FILL_IN: + operator sources>`) → COMPARE (candidates honestly: coverage, source reputation, maintenance, licence, fit vs our house standards) → PRESENT (each: what it is, why it fits vs alternatives, source URL — playbook 4.3) → STOP (no copying before explicit approval — playbook 4.4) → after approval: verbatim copy w/ provenance frontmatter (meta's skill-authoring-standards governs format; merges become custom per playbook 4.6).

## Instructions
1. Search by purpose, never by name — aspirational catalog names usually don't exist verbatim.
2. Empty results are presented as findings ("searched X/Y/Z for <purpose>, no fit — recommend custom"), which is exactly what makes honest `built from scratch` frontmatter possible.
3. Non-English sources: full faithful translation before any adoption (playbook 4.5).
4. Every adopted skill enters the adopt-reject-registry (skills are candidates too, not just tools) and gets a boundaries section naming which house skill wins conflicts.
5. Standing queue: sweep agent.md `PENDING` marketplace notes across the fleet each scan cadence — those are pre-authorized SEARCH requests (approval to adopt still separate, always).

## Output Format
Candidate presentations (what/why/URL per candidate, compared); empty-result findings; adoption paperwork per meta's standards after approval.

## Principles
- Purpose over name; presented before copied; approved before adopted — every time, no compression of the steps.
- An empty search honestly logged is the licence to build custom.
- Verbatim means verbatim: uncut content, provenance frontmatter, boundaries stated.

## Fallback
Marketplace sites unreachable? Log the coverage gap, search code hosts directly, and mark the pass `partial-sources` — a custom build justified by a partial search says so in its frontmatter.

## Boundaries with Other Skills
- ecosystem-scanning finds unsolicited candidates; this skill runs solicited searches. Same registries downstream.
- meta's skill-authoring-standards + writing-skills govern what happens after approval.
- The operator's approval is the gate — scout never adopts, merges, or installs on its own verdict.
