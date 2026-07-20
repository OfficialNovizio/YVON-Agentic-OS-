---
name: ecosystem-scanning
type: custom
status: built from scratch
fulfills_catalog_entry: ecosystem-scanning (catalog marketplace entry under scout; no verbatim source found 2026-07-10 — method built custom; repatriated from catalog's Market Intelligence, owner CAIO)
assigned_agent: scout (AI & Agents / Tool & Ecosystem Scanner)
portable: true
date_added: 2026-07-10
---

# Ecosystem Scanning

## Introduction
The recurring sweep of the AI tool/skill ecosystem — code hosts, MCP directories, skill marketplaces — filtered against the fleet's actual gaps, producing a shortlist, not a firehose.

## Purpose
The ecosystem moves weekly; the fleet shouldn't chase it, but it also shouldn't discover a load-bearing tool a year late. A disciplined scan converts noise into a small, gap-matched shortlist.

## When to Use
- Scan cadence fires (`<FILL_IN: suggested weekly, catalog default>`).
- A named gap needs a targeted sweep ("find us an X").
- A department build begins (pre-build marketplace pass — the playbook's search, standing).

## Structure / Protocol
SOURCES (dated list: assets kept per-scan — currently skillsmp.com, mcpmarket.com, awesomeskill.ai, github topic feeds, MCP registry `<FILL_IN: + operator additions>`) → SWEEP → FILTER (against the gap register: current `PENDING` items from agent.md files, logical-book wants, integration candidates) → SHORTLIST (max `<FILL_IN: suggested 5>` per scan, each with source URL + which gap it matches) → HAND OFF (tools → tool-evaluation-intake; skills → marketplace-skill-scouting).

## Instructions
1. The filter is the skill: nothing enters the shortlist without a named fleet gap it addresses. "Cool" is not a gap.
2. Sources are a dated asset — dead or degraded sources get replaced at the scan, noted in the scan log.
3. Every scan logs: sources swept, items considered (count), shortlist (with URLs), and zero-result gaps (so recurring empty searches become "build custom" evidence).
4. Repeat candidates are cross-checked against the adopt-reject registry first — re-surfacing a logged rejection requires new information, stated.
5. Scanning is read-only reconnaissance: no installs, no trials, no registrations — those belong to the intake skills downstream.

## Output Format
Dated scan log: sources, counts, shortlist table (item / URL / matched gap / route), zero-result gaps.

## Principles
- Gap-matched or discarded — the shortlist is small on purpose.
- Zero results are findings; logged rejections stay rejected without new evidence.
- Look, don't touch: reconnaissance never installs.

## Fallback
Sources unreachable or scan tooling unavailable? Log the skipped scan explicitly (a gap in coverage is a fact the fleet should see) — never backfill from memory.

## Boundaries with Other Skills
- tool-evaluation-intake and marketplace-skill-scouting consume the shortlist; adopt-reject-registry is checked first and updated last.
- radar (future Market Intelligence) scans MARKETS; scout scans the TOOL/AI ecosystem — clean subject split (redesign plan §5).
- forge receives technique-shaped finds; edge receives platform/infrastructure-shaped finds.
