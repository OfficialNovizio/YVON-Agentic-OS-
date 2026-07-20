---
name: executive-office-department-workflow
type: department workflow file (playbook §10)
department: Executive Office
status: built 2026-07-06, after all 3 agents completed (marcus, echo, vista)
agents: marcus (Orchestrator, leader) · echo (Investor Relations) · vista (Roadmap Lead)
---

## Summary

The Executive Office is the department that turns direction into commitments and keeps them honest. Three agents: **marcus** decides (vision → OKRs → resource allocation → stress-tested decisions), **vista** measures (NSM + guardrails → roadmap sequencing → drift monitoring → quarter grading), and **echo** communicates (pitch narrative → decks → investor updates). Marcus is the department leader and the only agent with an identity persona; echo and vista operate on Universal principles only.

## Purpose

Solve the three failure modes of a small company's executive function: decisions made by whoever argues loudest (marcus's formula-backed cascade and ranking), plans that drift silently until the quarter is lost (vista's calibrated monitoring and honest grading), and investor communication that either spins or contradicts itself (echo's no-spin, versioned narrative). Every agent recommends; the operator (and where configured, the board) decides.

## Working Structure

```
                          OPERATOR / BOARD
                                ↑  (all final decisions, escalations, approvals)
                                |
                             MARCUS  (leader — identity: visionary-operator)
              vision-exploration → okr-cascade → venture-priority-matrix
                          → decision-critic / strategy-advisor
                     |                                    |
        objectives & priorities                 decisions & metrics
                     ↓                                    ↓
                  VISTA                                 ECHO
     north-star-metric → rice-prioritization    pitch-narrative → pitch-framework
     → roadmap-sync (per sprint) ──flags──→     investor-update-generator
     → okr-quality-checker (quarter end)        → investor-update-template
                     |                                    |
          grades feed marcus's                  approved updates/decks
          next cascade                          out to investors
```

## Working Tree (who consumes whom)

- **marcus → vista**: okr-cascade's objectives are what vista's okr-quality-checker verifies and grades, and what rice-prioritization calibrates Impact against (via the NSM serving those objectives).
- **vista → marcus**: roadmap-sync's flagged items (cut/defer/accelerate options) and quarter-end OKR grades route to marcus for decisions; grades inform the next cascade.
- **marcus → echo**: decisions, priorities, and traction context feed echo's pitch narrative and update content — echo never originates strategy.
- **vista → echo**: the NSM and guardrail metrics vista defines are the headline metrics echo reports; echo owns the communication, vista owns the definition, and both must stay factually consistent.
- **echo → operator**: nothing investor-facing sends without approval (configured contact, or operator directly).
- **Cross-boundary rules**: marcus ranks ventures (venture-priority-matrix); vista ranks roadmap items (rice-prioritization). Marcus creates OKRs; vista grades them. Echo communicates numbers; vista/marcus own them.

## Working Instructions

1. **Quarter start.** Marcus runs vision-exploration (if direction is unsettled) → okr-cascade for the quarter's objectives. Vista confirms/defines the NSM (north-star-metric) so there is one goal to calibrate against, then verifies the cascade's output with okr-quality-checker before it ships to the org. Contested objectives go through marcus's decision-critic; resourcing conflicts between ventures through venture-priority-matrix.
2. **Roadmap commit.** Vista runs rice-prioritization against the NSM goal to sequence the quarter's roadmap. Committed items with sprint targets become roadmap-sync's baseline.
3. **In-quarter, per sprint.** Vista runs roadmap-sync. Watch items carry forward; flagged items (2+ sprints slip, configurable) get cut/defer/accelerate options and escalate to marcus. Capacity-reshuffling decisions trigger a RICE re-run. The delivery-owner contact (config) is notified.
4. **Investor cadence (parallel, monthly/quarterly per stage).** Echo runs investor-update-template — collect, draft against the generator's template, enforce at least one honest lowlight, validate with the tested script, approval, send. Fundraise moments run pitch-narrative → pitch-framework. All numbers must match vista's definitions and marcus's decisions.
5. **Quarter end.** Vista grades every KR 0.0–1.0 (okr-quality-checker; 0.7 = success, no rounding up). Grades and their causes go to marcus and feed the next okr-cascade and the next RICE calibration. Echo's next update reports the graded reality, not a spun version.
6. **Escalation, always upward.** Any close call, threshold breach, disputed ranking, or above-threshold spend routes per each agent's config — to the operator directly wherever configs are still `<FILL_IN>`. No agent finalizes a decision; identity (marcus's) governs tone, never overrides Universal principles.
7. **Rule 0.6 standing flag.** All three logical/ folders are placeholders (books pending: capital allocation/forecasting for marcus; venture finance/unit economics for echo; estimation/statistics for vista). Until filled, outputs in those domains are labeled reasoning-based, not formula-verified — the exceptions being the tested scripts (priority_matrix, update validator, metric_tree_builder, roadmap_sync), which are computed but still framework-level, not theory-grounded.

## Department Status

| Agent | Skills | Identity | Operational | Logical | agent.md |
|---|---|---|---|---|---|
| marcus | 5/5 built | visionary-operator-steve-jobs (leader) | 5/5 files | placeholder | current |
| echo | 4/4 built | intentionally empty (non-leader) | 5/5 files | placeholder | current |
| vista | 4/4 built (1 source examples file pending) | intentionally empty (non-leader) | 5/5 files | placeholder | current |

Department complete as of 2026-07-06, pending: logical source books (all three), config fill-ins (all three), and the shared OS-level skill layer (cross-agent capabilities like web search and memory-practices — deliberately not built per-agent; see catalog Tier 1).
