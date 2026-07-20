---
name: agent-architecture-standards
type: custom
status: built from scratch
fulfills_catalog_entry: none — added by AI & Agents redesign plan §3 (catalog had no fleet-architecture owner)
assigned_agent: meta (AI & Agents / Fleet Architect, department leader)
portable: true
date_added: 2026-07-10
---

# Agent Architecture Standards

## Introduction
The structural law for every agent in the fleet: what an agent IS on disk, which files it must have, and how that structure maps onto the deployment platform. Built from scratch — it operationalizes the operator's AGENT-BUILD-PLAYBOOK as a skill meta runs, so structure stops depending on whoever built last.

## Purpose
Prevents structural drift: agents with missing folders, identity content outside leaders, skills without provenance, or department layouts that can't be deployed. Every structural question in the fleet resolves here.

## When to Use
- A new agent is proposed, promoted from prototype, or imported.
- An audit (anneal's skill-quality-audit) flags a structural violation.
- Anyone asks "where does X go?" for an agent artifact.
- A deployment mapping question arises (see assets/platform-structure-map.md).

## Structure / Protocol
1. CHECK — compare the agent against the standard shape below.
2. CLASSIFY — each deviation: violation (fix required) or proposed variation (needs Rail 3 proposal).
3. ROUTE — violations → anneal (fix proposal → board); variations → board directly.
4. RECORD — verdicts land in the fleet registry (fleet-registry skill).

## Instructions
**The standard agent shape (non-negotiable):**
```
<Department>/<agent-name>/
├── agent.md                      # summary, position, skill roster, status, workflow
├── marketplace/<skill>/SKILL.md  # verbatim copies + provenance frontmatter
├── custom/<skill>/SKILL.md       # + assets/, scripts/ as needed
├── operational/{principles,commands,agent,skill,tool}/
├── logical/                      # formulas from operator-supplied books, or a placeholder
└── identity/                     # content ONLY for the department leader; folder always present
```
Rules meta enforces:
1. All five top folders exist for every agent — empty ones carry a one-line README saying why (never silently absent).
2. Identity content only for the department leader; exactly one persona document to start.
3. Every SKILL.md carries the house frontmatter (see skill-authoring-standards) — no provenance, no skill.
4. No venture, business, or product names in any executable content — only in provenance frontmatter. Placeholders (`<FILL_IN>`) over invented values, always.
5. tool/ files specify needs, never grant them; agent/ configs contain only fields a real skill line references.
6. Department workflow file exists only after every agent in the department is complete.

## Output Format
Structural review verdict: PASS, or a numbered deviation list, each tagged `violation` / `variation`, each with its routing (anneal-fix or board-proposal). No third tag exists — "minor" is not a category (that's how drift starts).

## Principles
- Structure is law, content is judgment: meta blocks on structure, never rewrites content (that's anneal's proposal path).
- Identical shape beats optimal shape — predictability is the product.
- No exception "just this once": an exception is a Rail 3 proposal or it doesn't happen.

## Fallback
If the standard doesn't cover a case (new artifact type, new platform), meta drafts a standards amendment as a Rail 3 proposal to board — it does NOT improvise a local convention. Until the verdict, the closest existing rule applies, most restrictive reading.

## Boundaries with Other Skills
- skill-authoring-standards governs the *inside* of a SKILL.md; this skill governs everything *around* it.
- fleet-registry records what exists; this skill defines what's allowed to exist.
- Deployment mapping details: assets/platform-structure-map.md.
- Prototype-stage agents are exempt from full shape until promotion (proto's cage, Fleet Charter Rail 4) — promotion requires full compliance.
