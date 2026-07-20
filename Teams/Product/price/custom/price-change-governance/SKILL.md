---
name: price-change-governance
type: custom
status: built from scratch
fulfills_catalog_entry: none — new agent (price); the change-control that routes through board on locked commitments (redesign §2, §3, §5)
assigned_agent: price (Product / Pricing & Packaging)
portable: true
date_added: 2026-07-10
---

# Price Change Governance

## Introduction
The discipline for changing a live price or packaging: impact analysis, grandfathering of existing customers, and a routing rule that sends any change touching a Governance locked commitment (price guarantee, grandfathering promise) through board. Silent repricing is a trust incident; every price change is a logged proposal.

## Purpose
A price change is the highest-trust action product takes — it touches every customer's wallet and often a promise made to them. Governance makes changes deliberate: their impact is analyzed, existing customers are handled honestly, and commitments are never breached quietly.

## When to Use
- A validated pricing experiment (pricing-experiment-discipline) is ready to go broad.
- Packaging is being restructured for existing customers.
- Any live price or plan is changing — up, down, or repackaged.

## Structure / Protocol
IMPACT ANALYSIS (who's affected, revenue delta, churn risk, which segments; existing vs new customers separated) → LOCKED-COMMITMENT CHECK (does this touch a Governance locked commitment — price guarantee, grandfathering clause, contractual cap? if yes → board proposal, board's triple-pass; Governance dormant until its docs exist, so the proposal queues, anneal-style) → GRANDFATHERING (existing customers on old prices handled explicitly: honored, migrated with notice, or transitioned — never silently repriced; the default leans customer-favorable) → COMMUNICATION PLAN (changes are announced with notice, not discovered on an invoice — echo/comms own the message, price owns the substance) → PROPOSAL (the whole change is a logged proposal — impact + grandfathering + comms — approved before it ships; silent change is a trust incident) → SHIP (versioned, recorded; metric reads the revenue + churn outcome).

## Instructions
1. Never silent — every price change is a logged, approved proposal; a change customers discover on their invoice is a trust incident, full stop (the monetization analogue of metric's no-silent-definition rule).
2. Locked commitments gate at board — a change touching a price guarantee or grandfathering promise routes to board (Governance); until Governance's docs exist the proposal queues rather than proceeding (most-restrictive default).
3. Grandfather deliberately, customer-favorable by default — existing customers are honored, migrated with clear notice, or transitioned on stated terms; silently repricing someone who signed up under an old price is the cardinal sin.
4. Impact separates existing from new — the revenue/churn math is different for each; a change that's great for new customers and punishing for loyal ones is flagged, not averaged.
5. Communication is part of the change — notice, clarity, and honesty about why; price owns the substance, echo/comms own the delivery; no change ships without a comms plan.

## Output Format
Price-change proposal: impact (existing vs new, revenue Δ, churn risk) · locked-commitment check (→ board if in scope) · grandfathering plan · comms plan · approval · → ship (versioned) → metric outcome read.

## Principles
- Never silent — every change is a logged, approved proposal.
- Locked commitments gate at board; queue if Governance is dormant.
- Grandfather customer-favorable by default — never silently reprice loyalty.
- Communication is part of the change, not an afterthought.

## Fallback
Governance not yet built (no locked-commitments doc)? Assume commitments MAY exist — a proposal touching existing-customer prices queues for board review and defaults to grandfathering, rather than proceeding on the assumption there's no promise (most-restrictive, Fleet Charter default).

## Boundaries with Other Skills
- pricing-experiment-discipline supplies the validated change; pricing-research/packaging-tiers supply the new structure; metric reads the revenue+churn outcome.
- board/precedent (Governance): locked-commitment changes gate at board; precedent archives the proposal + verdict (Fleet Charter Rail 3 pattern, pricing edition).
- echo/comms (Executive Office): own the customer message; price owns the substance. felix/Finance (future): margin impact co-cited.
