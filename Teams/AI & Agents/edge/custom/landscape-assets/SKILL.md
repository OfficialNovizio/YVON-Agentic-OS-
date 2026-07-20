---
name: landscape-assets
type: custom
status: built from scratch
fulfills_catalog_entry: open-banking-landscape (catalog marketplace entry — venture-specific; genericized per redesign plan §6 into the dated-landscape-asset PATTERN; open banking becomes one optional operator-selected instance)
assigned_agent: edge (AI & Agents / Emerging Tech Gate)
portable: true
date_added: 2026-07-10
---

# Landscape Assets

## Introduction
The pattern for maintaining DATED domain-knowledge notes ("landscapes") on the technology domains the operator's businesses care about — framework milestones, standards, key players, integration surfaces. The catalog hardcoded one venture's domain (open banking); this skill is the generic vehicle, and that domain becomes one optional instance.

## Purpose
Scoring and watching emerging tech requires domain knowledge that goes stale fast. Dated, per-domain assets keep that knowledge honest (you can SEE its age) and portable (domains are config, not skill content) — the same three-layer volatility split Brand Studio pioneered: durable method in the skill, volatile knowledge in dated assets.

## When to Use
- The operator names a domain that matters (`<FILL_IN: operator domain list — e.g. a payments venture might select open banking; a commerce venture might select agentic checkout standards>`).
- A landscape's re-verify date arrives, or a material event lands (via watchlist/scout).
- Any scoring or watch decision needs domain context.

## Structure / Protocol
Each landscape asset (`assets/<domain>-landscape-<YYYY-MM>.md`): SCOPE (what the domain covers, why the operator cares — the named venture goal, referenced from config not restated) → STATE (current standards/frameworks/milestones, each with source + date) → PLAYERS (who moves the domain) → SURFACE (where the operator's stack would touch it — from the stack profile) → DELTAS (what changed since the last dated version) → RE-VERIFY (date, `<FILL_IN: suggested quarterly per catalog>`).

## Instructions
1. Every fact carries a source and a date — landscapes are reference documents, and unsourced landscape facts are rumors with formatting (no-fabrication rule, hard).
2. New versions are new dated files; old ones stay (the DELTAS section reads against them). Never edit a dated landscape in place.
3. Domains without operator selection don't get landscapes — edge doesn't freelance domain coverage (that's scout-style curiosity without a gap).
4. Landscape content informs scoring; it never SCORES — the axes and justifications live in tech-adoption-criteria memos.
5. A landscape overdue past its re-verify date is flagged on edge's report, and everything citing it inherits a `stale-data` marker (watchlist-discipline's fallback rule).

## Output Format
Dated per-domain asset files under `assets/`; a one-line index (domain / latest version / re-verify date / status) on edge's report.

## Principles
- Dated or it's drift; sourced or it's rumor.
- Domains are operator config — the pattern is permanent, the instances are chosen.
- New file per version; history is the value.

## Fallback
Operator hasn't selected domains yet (current state)? No landscapes exist and this skill idles honestly — the domain list is a named `<FILL_IN>` on the department's pending items. edge does NOT default to the catalog's example domain.

## Boundaries with Other Skills
- Feeds tech-adoption-criteria (scoring context) and watchlist-discipline (event interpretation).
- scout's scans surface events; landscapes interpret them within a domain.
- Brand Studio's dated-playbook pattern is the same design — shared philosophy, separate subjects.
