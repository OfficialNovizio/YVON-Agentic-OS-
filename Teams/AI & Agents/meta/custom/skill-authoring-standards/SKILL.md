---
name: skill-authoring-standards
type: custom
status: built from scratch
sources_referenced:
  - https://github.com/obra/superpowers/blob/main/skills/writing-skills/anthropic-best-practices.md (Anthropic authoring guidance, distilled with citation)
fulfills_catalog_entry: none — owns the Tier-1 "prompting-practices"-adjacent authoring layer the catalog left unstaffed
assigned_agent: meta (AI & Agents / Fleet Architect, department leader)
portable: true
date_added: 2026-07-10
---

# Skill Authoring Standards

## Introduction
The house standard for what goes INSIDE every SKILL.md in the fleet. Pairs with the verbatim marketplace copy `writing-skills` (obra/superpowers): that skill supplies the test-driven authoring METHOD; this one supplies the format LAW. Where they conflict, this skill wins.

## Purpose
Skills are the fleet's entire substance — plain-text files. If their format drifts, provenance vanishes, descriptions stop triggering, and the self-annealing loop has nothing reliable to edit. This skill makes every skill file auditable, discoverable, and portable.

## When to Use
- Any new skill is authored, adopted from a marketplace, or merged.
- anneal prepares a skill edit proposal (the edited file must still comply).
- An audit flags frontmatter, naming, or hardcoding violations.

## Structure / Protocol
AUTHOR (or ADOPT) → LINT (checklist below) → TEST (writing-skills method) → PROPOSE (Rail 3, board) → REGISTER (fleet-registry).

## Instructions
**1. Frontmatter — required on every skill, no exceptions:**
```yaml
---
name: <kebab-case, letters/numbers/hyphens only>
type: marketplace | custom
status: copied verbatim | built by merge | built from scratch | template
source: <URL — required if marketplace>
sources_referenced: <list — required if merged/distilled>
fulfills_catalog_entry: <original catalog name or "none — why">
assigned_agent: <agent> (<Department> / <role>)
portable: true|false   # false requires a listed reason
date_added: <YYYY-MM-DD>
---
```
**2. Body — custom skills:** Introduction, Purpose, When to Use, Structure/Protocol, Instructions, Output Format, Principles, Fallback, Boundaries with Other Skills. Marketplace copies keep the source's own structure, uncut, behind a selection-rationale comment block.
**3. Description discipline** (per Anthropic guidance + writing-skills SDO): third person; triggering conditions, not workflow summary; concrete symptoms and keywords; under ~500 chars.
**4. Conciseness:** body under 500 lines; heavy reference and reusable scripts go to `assets/` / `scripts/`, referenced one level deep only.
**5. Genericization:** no venture/product/stack names in executable content; stack-specific material becomes a DATED asset activated only when the operator's stack/venture profile names it; unknown values are `<FILL_IN>`, never invented.
**6. Time-sensitivity:** anything that can go stale (platform mechanics, tool versions, landscapes) lives in a dated asset with a re-verify note, never in the timeless method body.
**7. Scripts:** justified constants, explicit error handling, tested with sample input before the skill is presented as done.

## Output Format
Authoring lint verdict: PASS or numbered violations, each citing the rule number above. Machine check available: anneal's `skill_audit.py` covers rules 1 and 5 mechanically; the rest are meta's judgment.

## Principles
- No provenance, no skill — an unsourced skill file is a rumor.
- The description is the API: if it doesn't trigger, the skill doesn't exist.
- Format compliance is never waived for content quality ("it's good, ship it" is the drift that kills the fleet).

## Fallback
Source material in another language → translate fully before adoption (playbook 4.5). A skill that can't meet the standard (e.g., no identifiable source) is rebuilt as custom-from-scratch with honest frontmatter, or rejected.

## Boundaries with Other Skills
- `writing-skills` (marketplace, this agent): testing method — REQUIRED BACKGROUND for authoring; house format wins conflicts.
- agent-architecture-standards: everything outside the SKILL.md file.
- anneal's skill-quality-audit: mechanical enforcement of rules 1 & 5 at fleet scale.
- Shared OS `verification-before-completion`: binds the author before declaring any skill done.
