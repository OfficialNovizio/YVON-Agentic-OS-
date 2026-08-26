---
name: fx-exposure
type: custom
status: built from scratch
assigned_agent: treasure (Finance & Treasury / Treasury)
portable: true
date_added: 2026-07-29
tier: 3
description: "FX-exposure detection + reporting. Natural-hedge check first. Material exposure > threshold escalates. Never invents rates — reads live rates from configured source. Never hedges programmatically — routes to CFO."
triggers:
  - FX exposure
  - foreign exchange risk
  - currency mismatch
  - hedge check
  - what's our FX position
  - currency risk
---

# FX Exposure

## Purpose

Identify currency mismatches between inflows and outflows across ventures. Recommend natural-hedge structuring first; escalate material residual exposure.

## Structure / Protocol

```
1. PULL      per-currency AR + AP + reserves from ledger + entity-account-map
2. NET       compute net exposure per currency
3. NATURAL   check for natural hedge (matching in/out)
4. RESIDUAL  after natural hedge, quantify residual + % of revenue
5. FLAG      residual > threshold → escalate; recommend financial hedge to CFO
```

## Instructions

Rates from configured source (`treasure-config.md` — e.g., ECB reference rates, Fed daily H.10). Never model-inferred.

Natural-hedge first: match a GBP receivable against a GBP payable in the same window before recommending forward/swap.

Never programmatically execute a hedge. Analytical + routing only.

## Principles

- **Rates from configured source; never invented.**
- **Natural hedge first** — cheaper than financial hedges.
- **Threshold from config, not hardcoded.**
- **Never execute** — hand off to `felix` + CFO for decision.
- **Provenance every rate** — `[ECB]` `[Fed H.10]` `[configured source (date/time)]`.

## Boundaries

- `entity-account-map` (this agent) — per-currency balances.
- `cash-management` (this agent) — cash position aggregate.
- `felix` (F&T) — hedge decisions consumer.
- `board` — L3 for material exposure.
- Shared OS: `verification-before-completion`.

## Tool declaration

| Skill | Required | Optional | Source line |
|---|---|---|---|
| fx-exposure | File read (config, ledger, accounts) | Web fetch (rate source) · Rate API MCP | All steps |
