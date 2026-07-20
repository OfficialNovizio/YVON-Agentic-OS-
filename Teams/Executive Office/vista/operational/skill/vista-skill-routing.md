---
name: vista-skill-routing
type: operational/skill
status: consolidated from the "Boundaries" sections already defined within each of vista's skill files — no new logic invented
assigned_agent: vista (Executive Office / Roadmap Lead)
date_added: 2026-07-06
---

## Purpose

Vista's routing map: which skill hands off to which, and what depends on what. Sourced from the Boundaries/Integration sections already written into the four skill files. For request-level trigger precedence (which phrase routes where), see `operational/commands/vista-commands.md` — this file covers dependency relationships, not phrase matching.

## Where Identity Fits

Vista has no identity of its own — identity content is department-leader-only (marcus holds Executive Office's), and vista's principles are Universal-only. No tone layer sits on top of this routing map.

## The Quarterly Cycle

Vista's four skills form a loop that runs once per quarter:

```
        north-star-metric          (defines the NSM, input metrics, guardrails —
              |                     the goal everything else calibrates against)
              v
        rice-prioritization        (sequences the backlog into a committed roadmap,
              |                     Impact calibrated against the NSM goal)
              v
        roadmap-sync               (per sprint: diffs actuals vs the committed roadmap,
              |                     flags 2+ sprint slips, proposes cut/defer/accelerate
              |                     → escalates flagged decisions to MARCUS)
              v
        okr-quality-checker        (quarter end: verifies OKR quality and grades
                                    KRs 0.0–1.0 → grades feed next quarter's
                                    rice calibration and marcus's okr-cascade)
```

## Handoff Rules

- **north-star-metric → rice-prioritization**: rice's Stage 1 calibration needs one goal for Impact; that goal should be the NSM (or one of its input metrics). If no NSM exists yet, run north-star-metric first rather than calibrating rice against an ad hoc goal.
- **rice-prioritization → roadmap-sync**: roadmap-sync only runs against a *committed* roadmap. If none exists, its own Phase 1 fallback routes back to rice-prioritization.
- **roadmap-sync → marcus**: every flagged item's cut/defer/accelerate decision escalates to marcus. Vista recommends; marcus decides. A decision that reshuffles remaining capacity should trigger a rice re-run.
- **north-star-metric → roadmap-sync**: NSM inputs are the tiebreaker in cut-vs-accelerate recommendations ("feeds the top NSM input — accelerate before cutting").
- **okr-quality-checker ↔ marcus/okr-cascade**: marcus's okr-cascade *creates* OKRs; vista's okr-quality-checker *verifies and grades* them. Vista never redrafts objectives — quality failures route back to marcus as findings, not rewrites.
- **okr-quality-checker → next quarter**: end-of-quarter grades (and what drove them) are input to the next rice calibration and to marcus's next cascade.

## Cross-Agent Boundaries

- **vista/rice-prioritization vs marcus/venture-priority-matrix**: different altitude. Marcus ranks *ventures/initiatives* competing for the same resource pool (6-factor weighted score); vista sequences *roadmap items/features* within a venture (RICE). A conflict between ventures goes to marcus; a conflict between features stays with vista.
- **vista does not touch echo's territory**: metrics vista defines (NSM, guardrails) may appear in echo's investor updates, but echo owns the communication and vista owns the definition — both must stay factually consistent.

## Precedence When a Request Matches Multiple Skills

See `operational/commands/vista-commands.md` for the specific precedence rules (score-what disambiguation, sequencing-vs-monitoring). For anything not covered there, route to whichever skill matches the request's most specific, primary ask.

## Fallback

If a request doesn't fit anywhere in this map, ask what's actually being asked rather than forcing it into the nearest skill — consistent with each skill's own clarify-first guidance.

## Machine-Readable Routing (compiled)

```yaml
# yvon-compile: machine-readable routing — prose above remains canonical for humans
skills:
  north-star-metric:
    handoffs: defines the goal rice-prioritization calibrates against; run before rice if no NSM exists
  rice-prioritization:
    handoffs: needs the NSM for Stage 1 impact calibration; feeds roadmap-sync's committed roadmap
  roadmap-sync:
    handoffs: runs only against a committed roadmap; cut/defer/accelerate decisions escalate to marcus
  okr-quality-checker:
    handoffs: grades okr-cascade output — findings route back to marcus as findings, never redrafts
```
