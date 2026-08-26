---
name: cash-management
type: custom
status: built from scratch
assigned_agent: treasure (Finance & Treasury / Treasury)
portable: true
date_added: 2026-07-29
tier: 3
description: "Cash-position aggregate across entities + rebalance recommendations. Idle-cash sweep proposals. Never sweeps programmatically — proposes for CFO approval."
triggers:
  - cash position
  - cash aggregate
  - idle cash
  - rebalance accounts
  - cash sweep
  - buffer check
  - do we have enough cash
---

# Cash Management

## Purpose

Aggregate cash position across all entity accounts (from `entity-account-map`). Propose rebalancing (concentrate idle cash into higher-yield / reserve accounts). Buffer check against operator-set minimum working balance.

## Structure / Protocol

```
1. PULL      balances from entity-account-map (or bank MCPs if configured)
2. AGGREGATE by entity · jurisdiction · currency · account purpose
3. BUFFER    check each operating account against minimum per config
4. IDLE      identify balances above operating need > 30 days
5. PROPOSE   rebalance recommendations (never execute)
6. RETURN    dashboard + proposals + buffer flags
```

## Instructions

Buffer minimums per account come from `treasure-config.md`. Below-buffer → 🟠 flag.

Idle cash proposals: consolidate to central account · move to reserve / short-term treasury · never a specific instrument recommendation (that's CFO decision).

Never execute a transfer. Every proposal → operator + CFO approval.

## Principles

- **Never execute transfers.** Analytical + proposal only.
- **Buffer minimums from config.** Not model-inferred.
- **Idle-cash proposals are options**, not directives.
- **Provenance every balance.** `[bank statement date]` `[bank MCP feed date]` `[operator input]`.

## Boundaries

- `entity-account-map` (this agent) — supplies account list + balances.
- `fx-exposure` (this agent) — per-currency lens on same data.
- `felix / cash-flow-snapshot` (F&T) — different horizon (forecast); this is at-a-point-in-time.
- `board` — L3 for large-scale rebalance decisions.
- Shared OS: `verification-before-completion`.

## Tool declaration

| Skill | Required | Optional | Source line |
|---|---|---|---|
| cash-management | File read (config, account map, balances) | Bank MCP for auto-refresh | All steps |
