---
name: pilot-spec-handoff
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-tech-adoption-criteria protocol step 3 ("above → pilot spec to proto"), expanded to its own skill
assigned_agent: edge (AI & Agents / Emerging Tech Gate)
portable: true
date_added: 2026-07-10
---

# Pilot Spec Handoff

## Introduction
The packaging step between "this tech scored above the bar" and "proto runs a caged experiment": one pilot spec containing the hypothesis, the scoring context, and the constraints — so proto's manifest writes itself and nothing gets lost at the boundary.

## Purpose
Handoffs are where context dies (the cross-agent-handoff problem, applied here). A scored adoption verdict without a crisp pilot spec becomes a vague prototype that can't fail honestly.

## When to Use
- tech-adoption-criteria produces an above-bar verdict.
- proto bounces a spec back as under-specified (repair loop).
- A pilot completes and its verdict needs to flow back into edge's records.

## Structure / Protocol
SPEC (one page: the tech + version; the ONE hypothesis the pilot tests — derived from the fit axis's named goal/gap; scoring memo attached; constraints: budget `<FILL_IN>`, compliance conditions from the regulatory axis, timebox recommendation; what PROMOTE would mean here — adoption path sketch) → HANDOFF (to proto: echo-confirmed — receiver restates the hypothesis; mismatch = repair before build) → TRACK (pilot registered, edge keeps a pointer) → RETURN (proto's verdict flows back: promote-path techs re-enter as adoption proposals with pilot evidence; archived ones update the watchlist or drop, with the learnings ref).

## Instructions
1. One hypothesis per spec, same law as proto's kit — a tech that needs three pilots gets three specs, prioritized.
2. The spec's hypothesis must trace to the fit axis: "we scored fit 4 because of gap X; the pilot tests whether it closes gap X." Pilots without a named gap are curiosity in a suit.
3. Regulatory-axis conditions travel INTO the pilot as cage constraints (e.g. no real customer data — which Rail 4 mostly guarantees anyway; extra conditions listed explicitly).
4. Echo-confirmation is mandatory: proto restates hypothesis + constraints; edge corrects before anything is built (never assume the receiver has session context).
5. Returns are edge's responsibility to chase: a pilot whose verdict never came back is an open item on edge's report, not proto's problem alone.

## Output Format
One-page pilot specs; handoff echo records; return entries (pilot verdict → watchlist/adoption-proposal update).

## Principles
- One hypothesis, one spec, one named gap.
- Echo-confirm or it didn't hand off.
- edge owns the round trip, not just the throw.

## Fallback
proto's queue is full or the sandbox is down? The spec parks in edge's records with its priority and the blocking dependency — parked specs appear on edge's report; they don't evaporate.

## Boundaries with Other Skills
- Upstream: tech-adoption-criteria. Downstream: proto (kit + eval-first-design consume the spec).
- AI-method-shaped pilots go to forge's technique-adoption instead — the shape test happens HERE, at spec time.
- Adoption proposals post-pilot are Rail 3 (meta's fleet-governance), with pilot evidence attached.
