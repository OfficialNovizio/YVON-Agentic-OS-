---
name: security-exception-process
type: custom
status: built 2026-07-10 (Fable)
based_on_catalog_entry: none — new; time-boxed, compensating-control exceptions (plan §3) — the fail-closed pattern edge/scout use
marketplace_search: 2026-07-10 — no standalone exception-process agent skill; kept custom (the discipline is this fleet's fail-closed pattern applied to security waivers).
assigned_agent: warden (Cybersecurity / CISO — leader)
portable: true
includes: assets/exception-register-template.md
date_added: 2026-07-10
---

# Security Exception Process

## Introduction
The disciplined way to say "yes, temporarily" to something that violates a security policy — without the exception becoming permanent and forgotten. Every exception is time-boxed, carries a compensating control, names a risk-owner, and expires (fail-closed) — the same discipline edge and scout apply to their gates, applied to security waivers.

## Purpose
Real businesses need exceptions — a legacy system that can't do MFA yet, a vendor without a DPA during a pilot. The danger isn't the exception; it's the *permanent, forgotten* exception that quietly becomes the breach. This process makes exceptions safe: bounded, mitigated, owned, and self-expiring.

## When to Use
- Something needs to violate a security policy temporarily.
- "Can we get an exception for X," "waiver," "we can't meet control Y yet."
- Exception review/expiry cadence.

## Structure / Protocol
REQUEST (what policy/control is being excepted, why, for how long) → COMPENSATING CONTROL (what reduces the risk meanwhile — a partial mitigation is required; "just ignore the control" is denied) → RISK + OWNER (the residual risk → warden's risk-register; a named owner accountable) → APPROVE (time-boxed; high-risk exceptions route to board like any risk acceptance) → EXPIRY (a hard expiry date; at expiry the exception is closed or explicitly renewed — never silently extended; **fail-closed** — an expired exception reverts to the policy) → TRACK (append-only register; the count of open exceptions is itself a risk signal).

## Instructions
1. **No exception without a compensating control.** "We can't do MFA on this legacy box" → "so it's network-isolated and monitored meanwhile." An exception with zero mitigation is just an unmanaged risk; denied.
2. **Time-boxed, always.** Every exception has an expiry; there is no permanent exception. At expiry it's closed (policy re-applies) or explicitly renewed with fresh justification — silent extension is forbidden (edge/scout's fail-closed).
3. **Residual risk to the register, owner named.** The risk that remains after the compensating control is a risk-register entry with an owner; high residual risk routes to board (it's a risk-acceptance decision).
4. **Expiry fails closed.** When an exception lapses, the system reverts to the secure policy default — not to "well, it was fine before." The expired-exception state is the loud one.
5. **Open-exception count is a signal.** A growing pile of exceptions means the policy doesn't fit reality (revise it) or discipline is slipping — surfaced to warden and the operator, not absorbed.
6. **warden processes; it doesn't self-approve high risk.** Low-risk exceptions warden can approve on policy; high-risk ones are the operator's/board's call (the security-inversion — warden recommends, the operator decides).

## Output Format
```
## Exception: [id] — policy/control: [what's excepted]
Reason · Duration → EXPIRY [date, hard] · Compensating control: [required]
Residual risk → register [R-ref] · Owner · Approval: [warden(low) / board(high)]
State: open / expired→policy-reverted / renewed-[date]
```

## Principles
- **No compensating control, no exception** — a bare waiver is denied.
- **Time-boxed, always** — no permanent exceptions; renewal is explicit.
- **Expiry fails closed** — lapse reverts to the secure default.
- **Residual risk owned + registered** — high risk → board.
- **Exception count is a risk signal** — a pile means the policy's wrong.
- **warden recommends; operator/board accept high risk** — the inversion.

## Fallback
- Emergency needs immediate exception → grant the shortest safe window with the strongest available compensating control, log it, and schedule the proper review — never an open-ended emergency waiver.
- Exception can't be mitigated at all → it's not an exception, it's an accepted risk → straight to the risk-register + operator/board decision.

## Boundaries with Other Skills
- **risk-register** (sibling): every exception's residual risk lives there; high-risk → board.
- **security-policy-framework** (sibling): exceptions are waivers *of* its controls; a pile of exceptions on one control means revise the policy.
- **board (Governance)**: high-risk exception approval = risk acceptance, gated there.
- **keyring / bastion / cortex / veil**: exceptions to their controls (an un-MFA'd account, an unhardened box) are processed here with their compensating controls.
