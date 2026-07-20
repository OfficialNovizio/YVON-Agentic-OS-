---
name: agent-prototype-kit
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-agent-prototype-kit (prefix stripped; sandbox limits bound to Fleet Charter Rail 4)
assigned_agent: proto (AI & Agents / Prototyping)
portable: true
date_added: 2026-07-10
---

# Agent Prototype Kit

## Introduction
The standard scaffold for spinning up an experimental agent: a caged manifest (Fleet Charter Rail 4), a pre-declared eval, an expiry date, and a registry entry marked `prototype`. See `assets/prototype-manifest-template.md`.

## Purpose
Experiments are how the fleet grows — and uncaged experiments are how it gets hurt. The kit makes trying things cheap AND safe: every prototype is sandboxed, time-boxed, and evaluated against criteria written before it exists.

## When to Use
- Anyone proposes a new agent or a significant agent variant ("what if we had an agent that...").
- edge's pilot-spec-handoff delivers an approved pilot needing an agent shape.
- A prototype needs its cage checked mid-flight.

## Structure / Protocol
SCAFFOLD (manifest from template: purpose, skills sketch, sandbox limits, registered-tools-only, expiry) → EVAL FIRST (success criteria via eval-first-design BEFORE any building) → REGISTER (meta's fleet registry, state `prototype`, expiry recorded) → RUN (caged: Engineering Rail 2 sandbox, no production data/memory, no unregistered tools — Rail 4 verbatim) → VERDICT (promote-or-archive-verdict at expiry).

## Instructions
1. The manifest is complete before any skill file is drafted — a prototype without a signed manifest is an unauthorized agent (registry incident).
2. Cage limits are non-negotiable defaults: sandbox per quinn's policy, tools only from relay's registry (trial grants), zero production data/memory access, expiry `<FILL_IN: default 14 days — reasoning-based (rule 0.6), catalog's 2-week verdict kept as suggested>`.
3. Prototype skills are exempt from full house structure until promotion (meta's standard, §Boundaries there) — but frontmatter and provenance are NEVER exempt (an unsourced prototype skill still can't exist).
4. One question per prototype: the manifest states the single hypothesis being tested. Multi-hypothesis prototypes get split — fuzzy experiments produce fuzzy verdicts.
5. Extension of expiry is a Rail 3 proposal (it's a fleet change), granted at most once `<FILL_IN: confirm policy>` — rolling prototypes are shadow agents.

## Output Format
Completed manifests; registry entries; cage-check reports (limits verified / violations escalated).

## Principles
- No manifest, no prototype. No criteria, no build. No expiry, no cage.
- One hypothesis per prototype.
- The cage is Rail 4 law, not a suggestion proto can relax.

## Fallback
Sandbox infrastructure unavailable? Prototypes are limited to paper prototypes (skill drafts + trace walkthroughs, no execution) — explicitly marked, still time-boxed, still verdict-ed.

## Boundaries with Other Skills
- eval-first-design writes the criteria this kit requires; promote-or-archive-verdict ends what this kit starts.
- meta registers; quinn's sandbox policy cages; relay's registry bounds tools.
- rapid-prototyping-method guides fidelity choices inside the cage.
