---
name: precedent-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: precedent (Governance / Institutional Memory)
date_added: 2026-07-07
---

## Purpose

What each of precedent's skills technically needs. Governance values live in `precedent-config.md`.

**This file specifies needs — it does not grant them.** Listing a capability here doesn't give precedent that capability; actual access is a separate runtime-configuration step wherever precedent is deployed. This table is the checklist for whoever does that configuration.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| ruling-log | File read + append (the shared decision log); search within the log (text/tag match) | An index file once the log passes `index_threshold` | Phase 3 "Append to the configured decision log"; Phase 4 retrieval |
| case-law-method | File read (ruling records) | — | Phase 1 "From the prior ruling's record" |
| consistency-check | File read + append (records, cross-marking overrules by reference) | — | Phase 4 logging |

## Notes

- No scripts and no Python requirement — precedent's work is reading, reasoning, and appending text records. The deliberate absence of a similarity script is a design choice: retrieval is tag + text match plus judgment, and per rule 0.6 any future ranking formula belongs in the logical layer with a real source behind it.
- No web search — deferred to the shared OS-level layer, consistent with all agents.
- In toongine deployment, "the log" resolves to the platform's graph memory; append/read semantics are what matter, not the storage form.

## How to Apply

File read/append on the decision log location is the floor for precedent to function.
