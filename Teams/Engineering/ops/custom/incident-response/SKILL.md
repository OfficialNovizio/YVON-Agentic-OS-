---
name: incident-response
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none in catalog (nobody owned production — plan §1 defect #1) — new, per plan §3
marketplace_search: 2026-07-09 — candidates found (thebushidocollective/han sre-incident-response; mcpmarket incident-response skills). Kept custom for department integration (post-mortems MUST feed quinn's regression map + dev's ADRs; Rail 3 constrains mitigation). Adopted with credit: P0–P3 severity convention, incident roles (commander/comms), blameless post-mortem structure
assigned_agent: ops (Engineering / DevOps & Reliability)
portable: true — severity definitions and comms channels are config; the discipline is universal
includes: assets/postmortem-template.md
date_added: 2026-07-09
---

## Introduction

incident-response is what happens when production hurts: classify severity fast, restore service first (usually release-discipline's rollback), communicate on a cadence, and afterward run a **blameless post-mortem whose outputs are mandatory feeds** — a quinn regression-map entry (or a written why-not) and, where the incident exposed a design flaw, a dev ADR. The post-mortem is where the department's self-annealing actually happens; an incident that doesn't teach the system was wasted twice.

## Purpose

Incidents are inevitable — dev's identity assumes everything fails all the time. What's optional is panic, silence, blame, and repetition. This skill removes all four: a fixed protocol replaces panic, a comms cadence replaces silence, blamelessness replaces blame (systems fail, people respond), and the map-feed replaces repetition.

## When to Use

Triggers: "incident," "production is down," "users are affected," monitoring alert past baseline (via connectors when bound), failed deploy verification with user impact, "post-mortem," "sev1/P1," security incidents (jointly with aegis when built).

## Structure / Protocol

```
DETECT (alert / report / failed deploy verify)
  -> CLASSIFY: P0–P3 (convention credited; definitions + response targets are CONFIG, not invented)
     P0 ~ total outage/data-loss-risk · P1 ~ core flow broken · P2 ~ degraded · P3 ~ cosmetic/contained
    -> ROLES (scaled to severity): incident commander (owns the incident) · comms (stakeholder updates
       on cadence) — one agent may wear both at P2/P3
      -> MITIGATE: restore service by the smallest safe action — rollback first candidate;
         Rail 3 holds even now: data fixes = prepared script → OPERATOR runs it, even at P0
        -> COMMUNICATE: updates every [cadence per severity, config] to escalation_contact/stakeholders
          -> RESOLVE: service restored + verified against baselines → incident closed for users
            -> POST-MORTEM (blameless, within [config] days): timeline · contributing factors ·
               what worked/failed · action items with owners
              -> MANDATORY FEEDS: quinn regression-map entry (or written why-not) ·
                 dev ADR if design flaw exposed · maintenance-hygiene baseline/alert updates
```

## Instructions

1. **Classify before diagnosing.** Severity decides response scale, comms cadence, and who's woken up — argue the classification later, in the post-mortem. When in doubt between two levels, take the more severe (de-escalating is cheap; escalating late is not).
2. **Mitigate with the smallest safe action.** Rollback (release-discipline) is the first candidate; flag-off second; forward-fix only when rollback can't help. **The charter holds during incidents:** emergency data repair is still a prepared script the operator runs (Rail 3) — an incident is exactly when a hijacked or panicking agent would claim destructive access is "necessary."
3. **Communicate on cadence, not on news.** "Still investigating, next update in N minutes" is a valid update; silence is not. Cadence per severity from config.
4. **Blameless means systems, not saints.** The post-mortem names contributing factors, decisions, and conditions — never culprits. An agent (or the operator) who erred is evidence of a system that allowed the error. Blame kills the information flow annealing depends on.
5. **The feeds are the point.** A post-mortem is INCOMPLETE (returned, tracked) until: the regression-map entry exists or a written why-not is recorded; action items have owners and dates; baseline/alert gaps found in DETECT are handed to maintenance-hygiene; design flaws become dev ADRs. quinn's principle 9 lands here: the loop has no silent exits.
6. **Recurrence is escalation.** A second incident from the same mapped fragility means the guard failed or the fix was cosmetic — escalate to dev with both post-mortems; that's ADR pressure, not another patch.

## Output Format

```
## Incident: [id] — P[0-3] — [one-line impact]
Timeline: detected [t] · mitigated [t] (+duration) · resolved [t]
Mitigation: [rollback/flag/fix] · Rail 3: [no data changes / operator-run script ref]
Comms: [updates sent, cadence met ✓/✗]

## Post-Mortem: [id] (blameless)
Contributing factors: [systems/conditions — no culprits]
Feeds: regression-map entry [RM-ref / why-not] · ADR [ref / n.a.] · baseline updates [refs]
Action items: [item · owner · date]
```

## Principles

- **Restore first, understand second** — diagnosis happens on a working system.
- **Severity is config-defined and decided fast** — doubt rounds up.
- **The charter holds mid-incident** — urgency is the classic excuse for the exact breach Rail 3 exists to stop.
- **Cadence beats news** — silence is the only wrong update.
- **Blameless or useless** — blame ends the information flow the map depends on.
- **No post-mortem, no closure; no map-feed, no complete post-mortem** — annealing is mandatory, not aspirational.
- **Same fragility twice = design problem** — escalate to dev, don't re-patch.

## Fallback

- Severity definitions unset in config → use the P0–P3 convention descriptions above, loudly labeled provisional; propose definitions to the operator after the incident, not during.
- No monitoring connectors bound → detection is human-report-driven; log this as the incident's first contributing factor every time until fixed.
- Incident spans security (breach/attack) → joint handling with aegis when built; until then, most-restrictive: isolate (Rail 2 spirit), preserve evidence, operator informed immediately.
- Post-mortem stalls (nobody writes it) → ops escalates to dev after [config] days; an unwritten post-mortem is an open incident.

## Boundaries with Other Skills

- **release-discipline** (sibling) supplies the rollback and the deploy records that often start the timeline.
- **maintenance-hygiene** (sibling) receives baseline/alert gaps; its baselines define "resolved."
- **quinn/regression-map**: the mandatory feed — this is the self-annealing loop's producing side.
- **dev/architecture-decisions**: design flaws exposed by incidents become ADRs; recurrence is ADR pressure.
- **aegis/cypher** (when built): security incidents are joint; cypher findings are *prevented* incidents and flow through quinn, not here.
- **board/sentinel** (Governance): incidents crossing spend or compliance lines surface there per their gates.
