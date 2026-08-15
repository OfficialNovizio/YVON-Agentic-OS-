<!--
Custom skill — adopted from the Anthropic workforce-planning-org-design plugin, then
genericized per §0.4b and retargeted to real YVON agents.

Source plugin: /var/folders/.../claude-hostloop-plugins/.../skills/workforce-planning-org-design/SKILL.md
Source frontmatter names "Amit Choudhary (for maslow / People & Culture)" as author — this
adoption strips the VYON-specific wrapping and reassigns to hire (this agent).

Note on the Python script: source SKILL.md references scripts/workforce_calculator.py but
that file was NOT included in the packaged plugin (only SKILL.md ships). Per §0.5 the script
is IMPLEMENTED-FROM-DESCRIPTION here — the formulas it encodes (FTE = hours/standard hours,
span = direct reports / manager, headcount gap = forecast - current, base/upside/downside
scenario multipliers) are basic HR arithmetic explicitly described in the source SKILL.md.
Provenance is recorded in the script docstring. Not classified as a Shared OS/logical/ script
per §8.0 / §13.5 because it does not yet meet the 2-book minimum — kept as an agent-local
utility until book-grounded (candidate texts: Cascio's Managing Human Resources; Bechet's
Strategic Staffing; SHRM certification textbooks).

Genericization strip (§0.4b) applied:
- "for maslow (People & Culture / CHRO agent)" → hire (People & Culture / Lead)
- "VYON Group Inc.", "Novizio live, Hourbour building, future brand planned" → generic
- "49-agent AI Council layered under a human Board" → stripped
- "External Platform division's client orgs" → "client organizations (multi-tenant use case)"
- "felix (Finance)" → board (via fiduciary-guard) + note that a future Finance agent will own this
- "comply/CLO council — comply, guard, scribe, shield" → operator escalation w/ employment-counsel note
- "board" → KEPT (real YVON agent per CLAUDE.md §2)

10 public-source citations from source (AIHR, iMocha, Korn Ferry, Stratechi, Workhuman,
Orgvue, Ingentis, theorgchart, Vena Solutions, HR Cloud) preserved verbatim in References.
-->
---
name: workforce-planning
type: custom
status: adopted from marketplace source, genericized
sources_referenced:
  - "Anthropic knowledge-work-plugins — workforce-planning-org-design plugin (2026-07-02 packaged version). SKILL.md only; referenced scripts/workforce_calculator.py not included in package."
  - "Strategic Workforce Planning 101: Framework & Process — AIHR."
  - "Workforce Planning Framework: 6 Key Steps — iMocha."
  - "Workforce Planning 2026: A Smart Approach to Talent Strategy — Korn Ferry."
  - "Organizational Design Playbook — Stratechi."
  - "Organizational Design: Principles, Models & Implementation — Workhuman."
  - "The Ideal Span of Control — Orgvue."
  - "Span of Control: Definition & Influencing Factors — Ingentis."
  - "Headcount Planning for HR & Finance — theorgchart."
  - "What Is Headcount Forecasting & Planning? — Vena Solutions."
  - "Headcount vs FTE Explained — HR Cloud."
fulfills_catalog_entry: n/a (skill added beyond the catalog's 8-skill floor per §2)
genericization_notes:
  - "'for maslow' → 'for hire' (reassignment)."
  - "'VYON Group Inc.', 'Novizio', 'Hourbour', '49-agent AI Council' — stripped."
  - "'felix (Finance)' → board via fiduciary-guard, with note that a future Finance agent will own budget mechanics."
  - "'comply/CLO council' → operator escalation with employment-counsel note (no CLO agent in YVON)."
assigned_agent: hire (People & Culture / Lead)
portable: true
date_added: 2026-07-29
tier: 3
description: Build strategic workforce plans, forecast headcount/FTE needs against business drivers, design or evaluate org structures (span of control, layers, reporting lines), and route capability gaps to build/borrow/buy/redesign decisions. Trigger on "workforce plan for", "headcount forecast", "FTE forecast", "span of control", "org design", "reorg", "hiring vs upskill", or "should we hire for this gap".
triggers:
  - workforce plan for
  - headcount forecast
  - FTE forecast
  - span of control
  - org design
  - reorg
  - hiring vs upskill
  - should we hire for this gap
  - do we need to add a layer
  - is this team over-managed
---

# Workforce Planning

## Introduction

This skill gives hire a repeatable method for answering two connected questions: "how many people, with what skills, do we need — and when?" (workforce planning) and "how should those people be structured and managed?" (org design). It combines a 4-phase strategic workforce planning framework, org-design structural principles (organizing principle, layers, span of control, reporting structure), and a headcount/FTE forecasting toolkit into one skill so recommendations are data-grounded rather than gut-feel. Adopted from the Anthropic `workforce-planning-org-design` plugin, genericized per §0.4b, and retargeted from the source's original author-assignment (maslow) to hire.

## Purpose

Answers the "should this req even exist right now?" question that sits *upstream* of `hiring-kit` — and the "does the receiving team's structure still work?" question that sits *around* every hire. Headcount and org decisions here have to serve fast-changing multi-venture growth rather than a single stable business. This skill produces workforce plans and org recommendations that:

- Tie directly to a stated business driver (revenue target, product launch, new-market entry) — never headcount asks "just because."
- Stay auditable — every number in the output is traceable to real data or a named assumption.
- Hand off cleanly to `board` (via fiduciary-guard) for budget validation and governance approval of any structural change.

## When to Use

Trigger on:

- "Build a workforce plan for [venture / department / group]"
- "Forecast headcount / FTE for [growth target / launch]"
- "Is our span of control healthy?" / "Do we have too many layers?"
- "Should we reorg?" / "Change reporting lines"
- "Hire vs upskill for this gap?"
- "Do we need another engineering team lead?" / "Add a manager layer?"
- Pre-check before `hiring-kit` opens a req when multiple reqs compete for budget

Do NOT use for:

- Individual performance management → `merit` (Performance Mgmt, when built).
- Compensation benchmarking or offer-letter comp → future `comp-benchmarking` skill (not yet built).
- Termination decisions → operator + employment counsel; this skill does not cover employment law.
- The hiring workflow itself (scorecard, loop, offer) once the req is validated → `hiring-kit`.
- ATS platform choice for the pipeline this feeds → `ats-selection`.

## Structure / Protocol

The 4-phase strategic workforce planning cycle. Treat as continuous, not annual — re-run demand forecasting whenever a venture's growth plan changes materially.

```
1. Current State Analysis   Headcount by function/venture, skills inventory, attrition,
                            org chart as it operates (not as drawn), open reqs.
2. Future Demand Forecast   Translate the stated business driver (revenue target, launch,
                            market entry) into role and capacity needs. Base/upside/downside
                            scenarios where the driver is uncertain — not a single point.
3. Skills Gap Analysis      Current vs forecast, by function. Flag BOTH shortages AND
                            redundancies. Structural gaps (no compliance role, no team lead
                            layer) surface here too — not just headcount gaps.
4. Strategic Action Plan    Convert each gap into a specific action: hire / redeploy /
                            upskill / redesign. Each action names an owner, timeline, and
                            rough cost. Cost estimate → board (fiduciary-guard) for budget
                            validation. Structural changes → board (constitution +
                            strategic-veto) for governance approval.
```

Sources for framework: AIHR "Strategic Workforce Planning 101"; iMocha "Workforce Planning Framework: 6 Key Steps"; Korn Ferry "Workforce Planning 2026" (see References).

## Instructions

Follow this sequence when producing a workforce plan or org design recommendation:

1. **Gather current-state data.** Headcount by function/venture, current org chart, attrition (voluntary/involuntary, by function), open reqs. If any of this is missing, say so explicitly per Fallback — do NOT assume.

2. **Pull the business driver.** The growth target, revenue plan, new-market launch, or product milestone this plan needs to serve. Ask for it if not given — a workforce plan with no business anchor is not usable. Do NOT invent a growth number per §0.5.

3. **Forecast demand.** Project roles/capacity needed against the driver. Use **base/upside/downside scenario modeling** rather than a single point estimate where the driver is uncertain (product launches and market entries always are). Use `scripts/workforce_calculator.py` for the arithmetic (see §Python Utility below).

4. **Run the gap analysis.** Current-state vs forecast, by function. Flag both shortages (need to add capacity) and redundancies (capacity in the wrong place). Note structural gaps too — a missing team-lead layer or a missing compliance role is a gap the "add another IC" default won't fix.

5. **Evaluate structure.** Check span of control and layer count against benchmarks for any team affected. Note where the structure itself (not headcount) is the constraint.

6. **Build the action plan.** For each gap, pick from the four routing actions:
   - **Hire** — bring in the capability from outside (route via `hiring-kit`).
   - **Redeploy** — move existing capability to where it's now needed.
   - **Upskill** — train existing person (future L&D skill, or `grove` agent when built).
   - **Redesign** — the role itself is wrong; redraw the role, not the headcount.
   Each action names an owner, timeline, and rough cost. Route the cost estimate to `board` (fiduciary-guard) for budget validation before treating it as final.

7. **Route structural changes through governance.** Any reorg that changes reporting lines or headcount materially routes to `board` (constitution-enforcement + strategic-veto) for the governance gate cycle. This skill produces the *recommendation*, not the approval.

8. **Present with assumptions visible.** Every number in the output should be traceable to either real data or a named, stated assumption/benchmark. Assumptions buried inside a number are a §0.6 failure.

## Org Design — Structural Elements

Org design decisions reduce to a small set of variables — get them deliberately, not by accretion:

- **Organizing principle** — function, product, market, or matrix.
- **Team framing** — what work belongs together?
- **Overall size** — how many people the structure has to support.
- **Layers** — number of levels between individual contributor and CEO.
- **Span of control** — direct reports per manager.
- **Reporting structure** — solid line vs dotted line vs shared.

**Span of control benchmark (heuristic, not rule):**

- ≤5 layers between individual contributor and CEO.
- Span of control in the **7–12** range.
- **Widen** span for standardized or highly autonomous work.
- **Narrow** span for high-complexity, high-coordination work.

These are a starting heuristic per the source and per Orgvue / Ingentis / theorgchart. They are NOT a rule; a 6-report span in a research team may be too *wide*, and a 14-report span in a shift-based ops team may be fine. Use them as a starting question, not an answer.

**RACI discipline:** whenever a reorg changes decision rights, pair it with a RACI (Responsible / Accountable / Consulted / Informed) pass so accountability doesn't get lost in the new structure. Missing this step is how reorgs produce silent decision-rights confusion for months.

## Headcount vs FTE

- **Headcount** counts *people*.
- **FTE (Full-Time Equivalent)** counts *capacity*: hours worked ÷ standard full-time hours.

Use headcount for org-chart and culture questions. Use FTE for cost modeling, productivity comparisons, and cross-period / cross-department capacity comparisons. They answer different questions and conflating them produces bad forecasts (Vena Solutions; HR Cloud; theorgchart).

## Python Utility

`scripts/workforce_calculator.py` provides the arithmetic for steps 3–5:

- `fte(hours_worked, standard_hours)` — hours ÷ standard hours = FTE
- `span_of_control(direct_reports, managers)` — direct reports ÷ managers = ratio
- `headcount_gap(current, forecast)` — forecast − current = gap (+ = shortage, − = redundancy)
- `scenario_projection(base, upside_pct, downside_pct)` — returns (downside, base, upside) triad

The script is IMPLEMENTED-FROM-DESCRIPTION per §0.5 — the source plugin's SKILL.md described these functions but did not ship the script file. See the script's module docstring for provenance. It carries self-tests (run `python3 workforce_calculator.py --test`) and is kept as an **agent-local utility**, not a Shared OS logical script, until paired with a second authenticated book source per §8.0.

## Output Format

Each invocation produces one or more of:

- **Workforce plan memo** — current state → business driver → demand forecast (base/upside/downside) → gap analysis → action plan (hire/redeploy/upskill/redesign per gap) → assumptions log.
- **Org-design memo** — organizing principle, layers, span, reporting structure — assessed against the benchmarks; specific structural recommendations; RACI update if decision rights change.
- **FTE / span-of-control forecast table** — machine-readable table produced by the Python utility.
- **Cost validation request** — routed to `board` (fiduciary-guard) with named cost assumptions.
- **Governance approval request** — routed to `board` (constitution + strategic-veto) for any structural change.

## Principles

1. **Every recommendation ties back to a stated business priority.** No headcount asks "just because." If a requester can't state the business driver, this skill blocks per Fallback.
2. **Assumptions are always visible, never buried in a number.** A number in the plan without a traceable source or named assumption is a §0.6 failure.
3. **Default to flatter, wider-span structures.** Only add layers when task complexity genuinely requires it — layers are permanent overhead once added.
4. **Cost implications get validated by governance before being presented as final.** Route cost estimates to `board` (fiduciary-guard) before treating them as sign-off-ready.
5. **Never surface identifiable individual performance data in workforce-planning outputs.** This skill operates at the role/function level, not the individual level. Individual perf data belongs in `merit` (when built), not here.
6. **Span-of-control numbers are heuristics, not rules.** Explicitly state this whenever presenting a span recommendation. A 7–12 target that a specific team should not hit is a legitimate outcome.
7. **§0.6 flag:** framework recommendations are Tier-B (canonical HR-analytics guidance per named public sources) until a workforce-planning book pair grounds a `Shared OS/logical/workforce_planning.py` per §8.0.

## Fallback

- **Missing current-state data** (no attrition history, no current org chart, no headcount-by-function breakdown): state the gap explicitly, substitute a named industry benchmark from References as a placeholder, and label the resulting plan as **directional / provisional** until real data is supplied. Never silently proceed with fabricated baselines.
- **No stated business driver.** Ask for one before forecasting demand. Do NOT invent a growth number per §0.5.
- **Request is a decision, not a recommendation** (e.g., "just tell me who to lay off"): this skill produces analysis and options, not final people decisions. Surface tradeoffs and route the actual decision to the operator or accountable executive.
- **Restructuring involving potential layoffs or employment-law exposure.** Flag to the operator that legal/compliance review is needed before execution; this skill does not cover employment law and no CLO agent exists in YVON to hand off to.
- **Cost estimate requested but no `board` context available.** Say so — a cost estimate presented without governance validation is not a plan, it is a guess.
- **Reorg proposed that would breach the Security Charter** (e.g., reducing security team span below charter-defined minimums): block per Charter senior-authority rule; route to `warden` or `bastion` for security-side review before the reorg is even discussed.

## Boundaries with Other Skills

| Hands off to | For | Direction |
|---|---|---|
| `hiring-kit` (custom, hire) | Any "hire" action from Instructions step 6 — opens the req and runs the loop | Downstream: this skill validates the req exists; `hiring-kit` fills it |
| `ats-selection` (custom, hire) | Pipeline platform for reqs this skill authorizes | Two-hop downstream via `hiring-kit` |
| `payroll-and-eor` (custom, hire) | Worker classification for any new hire type this skill's scenarios propose (contractor vs employee vs EOR) | Post-hire; also relevant when redeploy/upskill actions have location changes |
| `board` (Governance — fiduciary-guard skill) | Budget validation of any cost estimate; governance approval of any structural reorg | Escalation for both cost and structure |
| `board` (Governance — constitution-enforcement + strategic-veto) | Structural change gate; check that reorg doesn't breach locked strategic commitments | Escalation |
| Future `merit` agent (P&C — Performance Mgmt) | Individual performance signals that this skill will NEVER surface but that inform the "redeploy" and "upskill" action choices | Reference only; this skill stays aggregate-only |
| Future `grove` agent (P&C — Learning & Dev) | The upskill action's actual training-program design | Downstream when upskill is chosen |
| Future `comp-benchmarking` skill | Cost estimates for hire-action rows | Downstream when hire is chosen |
| Future Finance department/agent | Long-term owner of budget validation; currently routed to `board` | Placeholder for future YVON build |
| Operator + employment counsel | Anything touching employment law (layoffs, restructuring, protected-class impact) | Escalation; no CLO agent in YVON |
| `Shared OS: verification-before-completion` | Evidence gate on every plan and every cost estimate before it ships | Cross-cutting |

## References

- [Strategic Workforce Planning 101: Framework & Process — AIHR](https://www.aihr.com/blog/strategic-workforce-planning/)
- [Workforce Planning Framework: 6 Key Steps — iMocha](https://www.imocha.io/blog/workforce-planning-framework)
- [Workforce Planning 2026: A Smart Approach to Talent Strategy — Korn Ferry](https://www.kornferry.com/insights/featured-topics/workforce-management/strategic-workforce-planning)
- [Organizational Design Playbook — Stratechi](https://www.stratechi.com/organizational-design/)
- [Organizational Design: Principles, Models & Implementation — Workhuman](https://www.workhuman.com/blog/organizational-design/)
- [The Ideal Span of Control — Orgvue](https://www.orgvue.com/resources/articles/ideal-span-control-see-intervene/)
- [Span of Control: Definition & Influencing Factors — Ingentis](https://www.ingentis.com/en/knowledge/span-of-control/)
- [Headcount Planning for HR & Finance — theorgchart](https://theorgchart.com/headcount-planning-step-by-step-guide-best-practices/)
- [What Is Headcount Forecasting & Planning? — Vena Solutions](https://www.venasolutions.com/blog/headcount-planning-forecasting)
- [Headcount vs FTE Explained — HR Cloud](https://www.hrcloud.com/resources/glossary/headcount-vs-fte)
