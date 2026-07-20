---
name: precedent-commands
type: operational/commands
status: consolidated from trigger phrases in precedent's skill files — no new triggers invented; precedence rules added where triggers overlap
assigned_agent: precedent (Governance / Institutional Memory)
date_added: 2026-07-07
---

## Purpose

Routing reference for precedent: phrase → skill, plus precedence for the overlapping "past rulings" vocabulary.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| ruling-log | "log this ruling," "record the decision," "past rulings on [topic]," "what did we decide about" | `/precedent-log`, `/precedent-find` |
| case-law-method | "apply precedent," "does the past ruling apply here," "are these cases the same" | `/precedent-apply` |
| consistency-check | "consistent with past," "precedent conflict," "can we rule differently this time" | `/precedent-consistent` |
| (full pipeline) | a live gate review with precedents on point — runs retrieval → method → check automatically | `/precedent-review` |

## Precedence Rules

### "Past rulings" — find vs apply vs check
Route by what's being asked of the precedent: *retrieve it* (what did we rule?) → ruling-log; *reason from it* (does it control this case?) → case-law-method; *test a proposed ruling against it* (are we contradicting ourselves?) → consistency-check. When a request spans all three ("check this against past rulings"), run the full pipeline in order.

### Capture always runs last
Whatever else ran, a finalized ruling ends in ruling-log capture. No review exits the pipeline unrecorded.

### What precedent does NOT take
- Making or changing rulings → board (and the operator). Precedent informs, constrains, and records.
- Amending the constitution or commitments → operator; a pattern of overrules against one article is *flagged* to the operator as amendment pressure, nothing more.
- Audit-trail integrity design → sentinel (audit-trail-method); precedent follows those practices, doesn't define them.

## Fallback

No clear match → ask what's being sought (a record, an application, or a contradiction test) rather than guessing.
