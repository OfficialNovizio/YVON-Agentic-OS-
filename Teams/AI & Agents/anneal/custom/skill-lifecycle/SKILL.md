---
name: skill-lifecycle
type: custom
status: built from scratch
fulfills_catalog_entry: none — the redesign plan's "missing agent" (§1.3): the catalog staffed skill birth (proto) but not skill life
assigned_agent: anneal (AI & Agents / Skill Lifecycle & Annealing)
portable: true
date_added: 2026-07-10
---

# Skill Lifecycle

## Introduction
Every skill file in the fleet has a life: authored → active → revised (versioned) → deprecated → retired. anneal owns that arc for the whole fleet — the librarian and surgeon of the plain-text layer the entire system is made of.

## Purpose
Skills that nobody maintains rot: stale dates, dead references, superseded methods still triggering. This skill keeps the fleet's substance current without ever changing it silently.

## When to Use
- A skill needs revision (from a lesson, audit finding, or routed degradation case).
- A skill is superseded, unused, or wrong → deprecation/retirement question.
- "What version of X was live when Y happened?" (history question).

## Structure / Protocol
INTAKE (finding/lesson/case) → ASSESS (revise / deprecate / retire / no-action, with reasons) → PROPOSE (Rail 3: change proposal → board) → APPLY (exactly as approved) → VERSION (dated changelog line in the skill's frontmatter history) → NOTIFY (owning agent + gauge for re-measurement).

## Instructions
1. **No edit without a board-approved proposal** — no autonomy tier for typos, dates, or "obvious" fixes (operator decision 2026-07-10). Trivial fixes batch into one proposal; they don't bypass it.
2. Versioning: every applied change appends to a `history:` list in the skill's frontmatter (`date · proposal ID · one-line summary`). The before-text lives in the archived proposal (precedent), not in the skill file.
3. Deprecation: skill keeps working but its description gains a `DEPRECATED — use <successor>` prefix (a proposal like any other). Retirement: content replaced by a tombstone pointing to the successor + archive ref; the folder stays (structure law, meta's).
4. Dormant-skill sweep at audit cadence: skills whose triggers never fire (commands-table cross-check) get a keep/deprecate assessment — unused is a finding, not a verdict.
5. Marketplace copies: never revised in place. Upstream changed → re-fetch as a new dated adoption proposal; our local fix → the skill converts to `built by merge` custom with honest frontmatter.

## Output Format
Lifecycle assessments (`revise/deprecate/retire/no-action` + reasoning); proposals per meta's template; changelog lines.

## Principles
- The letter of Rail 3 is its spirit: an unproposed edit is a violation even if it's correct.
- History is sacred — a skill's past states must always be recoverable.
- Retire loudly: a tombstone beats a vanished file.

## Fallback
board dormant (Governance docs missing)? Assessments and proposals still happen — they QUEUE (fleet-governance §5). A critical wrong-skill situation the queue can't wait for → the only unilateral action is flagging the skill's description with `⚠ UNDER REVIEW (queued proposal <id>)` — a warning label, not an edit of substance. Content stays untouched.

## Boundaries with Other Skills
- self-annealing-loop generates most intake; skill-quality-audit generates the rest.
- meta's skill-authoring-standards defines what a compliant revision looks like; meta's fleet-governance routes the proposal.
- Owning agents stay the skill's users; anneal is its editor, never its author-of-record.
