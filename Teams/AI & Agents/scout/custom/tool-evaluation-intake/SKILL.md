---
name: tool-evaluation-intake
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-tool-evaluation (prefix stripped; security contact genericized from named agent to role — the fleet's appsec agent is aegis; cost review routes to operator/finance config)
assigned_agent: scout (AI & Agents / Tool & Ecosystem Scanner)
portable: true
date_added: 2026-07-10
---

# Tool Evaluation Intake

## Introduction
The gate between a shortlisted tool/MCP and the fleet: security screen, cost, overlap check, sandboxed trial with pre-set success criteria, then an adopt/reject verdict that relay can register.

## Purpose
Every tool is attack surface (tool poisoning and excessive agency live exactly here). Intake makes adoption deliberate: screened, trialed, and recorded — either way.

## When to Use
- ecosystem-scanning shortlists a tool, or an agent requests one directly.
- A trial period expires (verdict due).
- A previously rejected tool re-surfaces with new information.

## Structure / Protocol
SCREEN (security: against aegis's shared detection-classes asset + supply-chain sanity — source reputation, maintenance, permissions requested; cost: vs `<FILL_IN: budget threshold — escalation per config>`; overlap: vs relay's registry — a duplicate needs a reason the incumbent fails) → CRITERIA (success criteria written BEFORE the trial; eval-first, same discipline as proto) → TRIAL (sandboxed — Engineering Rail 2; registered `trial` with relay; duration per relay's trial period) → VERDICT (adopt → relay registers active + grants flow; reject → registry entry with reasons) → RECORD (adopt-reject-registry, either way).

## Instructions
1. No trial without pre-written success criteria — criteria written after usage are rationalizations.
2. Security screen findings route to aegis for judgment when non-trivial; scout screens, aegis adjudicates (shared asset, owned there — never duplicated here).
3. Overlap verdicts are honest: "nicer UI" doesn't displace a working incumbent; displacement recs include migration cost (forge's discipline, borrowed).
4. Trials touch no production data and no unregistered egress — the cage is the same as proto's (Fleet Charter Rail 4 pattern).
5. Expiry without a verdict = reject by default (fail closed), recorded as `expired-untested` — a queue that silently extends trials is a backdoor.

## Output Format
Intake report per candidate: screen results, criteria, trial evidence, verdict + reasons, registry refs.

## Principles
- Criteria before trial; verdict at expiry; recorded either way.
- Screen with aegis's classes, judge with aegis — security is shared, not duplicated.
- Fail closed on silence.

## Fallback
Sandbox unavailable for a trial? The tool waits — an untrialed adopt verdict is not issuable. Method-only review (docs, code reading) may produce `watch`, never `adopt`.

## Boundaries with Other Skills
- Upstream: ecosystem-scanning. Downstream: relay (registration/grants), adopt-reject-registry (record).
- aegis: security judgment. forge: technique-shaped candidates go there instead. quinn: sandbox policy owner.
