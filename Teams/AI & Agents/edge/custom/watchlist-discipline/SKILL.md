---
name: watchlist-discipline
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-tech-adoption-criteria protocol step 2 ("below bar → watch list with re-check date"), expanded to its own skill
assigned_agent: edge (AI & Agents / Emerging Tech Gate)
portable: true
date_added: 2026-07-10
---

# Watchlist Discipline

## Introduction
The managed list of below-bar technologies: what we're watching, what would change the verdict, and when we look again. A watchlist with discipline; without it, "watch" means "forget politely."

## Purpose
Most emerging tech isn't ready YET — the value is re-checking at the right moment with the original scoring in hand, instead of rediscovering the tech from zero when a competitor adopts it.

## When to Use
- tech-adoption-criteria produces a below-bar verdict.
- A re-check date arrives (calendar-driven from the list, not memory).
- A watched tech has a material event (major release, regulation change, ecosystem shift — often via scout's scans).

## Structure / Protocol
ENTER (tech, scoring memo ref, the SPECIFIC axes that failed, trigger conditions — "what event would move axis X above 3?", re-check date `<FILL_IN: default interval — suggested quarterly per catalog>`) → WATCH (scout's scans + landscape-asset updates feed material events) → RE-CHECK (re-score ONLY the failed axes first; full re-score if any moved) → OUTCOME (still-watch with new date / promote to full re-scoring / drop with reasons).

## Instructions
1. Every entry names its trigger conditions — an entry that can't say what it's waiting for is a drop candidate, not a watch.
2. Material events between re-checks pull the re-check forward; calendar dates are the floor, not the ceiling.
3. Drop honestly: tech that's been watched through `<FILL_IN: suggested 3>` cycles without axis movement gets a drop-or-justify review — an immortal watchlist is a graveyard with extra steps.
4. The list is append-only history like every fleet registry (entries close with outcomes; they don't vanish).
5. Watchlist review is part of edge's report to the operator: current entries, ages, next re-checks — one table.

## Output Format
Watchlist rows: tech / failed axes / triggers / re-check date / history. Re-check memos referencing the original scoring.

## Principles
- A watch entry is a question with a date, not a bookmark.
- Events beat calendars; calendars beat memory.
- Drop-or-justify — lists that only grow are lists nobody reads.

## Fallback
Re-check due but landscape data is stale (asset overdue)? Refresh the landscape asset FIRST (or mark the re-check `stale-data` and short-cycle it) — re-scoring on stale data launders old conclusions as new ones.

## Boundaries with Other Skills
- Fed by tech-adoption-criteria; feeds back into it at re-checks.
- scout's ecosystem-scanning is the event radar; landscape-assets the knowledge base.
- Drops and promotions are recorded verdicts (adopt-reject-registry pattern; edge's list stays its own — tech ≠ tools, different registries, same discipline).
