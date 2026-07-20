# Fleet Charter — AI & Agents Department (operator-owned law)

**Status:** TEMPLATE — becomes law only when the operator fills the `<FILL_IN>` fields and signs §6.
**Authority:** Operator-owned. No agent may waive, weaken, or reinterpret a rail. Amendment is operator-only.
**Precedence:** Engineering Security Charter ≥ Fleet Charter > stack/venture profiles > agent configs > convenience. A conflict halts the action and escalates to the operator.
**Scope:** Binds every agent in every department the moment it touches fleet-level activity: registering a tool, changing a skill, creating an agent, changing a model.

---

## Rail 1 — No unregistered capability

Every tool, MCP server, connector, or external capability any agent can call MUST have an entry in the fleet tool registry (owned by **relay**) before first use, recording: what it is, auth method, owner, scopes, and the per-agent access map.

- A tool call with no registry entry is an **off-plan call** — it feeds Engineering Rail 1 (plan-lock) and halts + escalates.
- relay's registry is the **authoring point** for the egress allowlist that Engineering Rail 2 (sandboxing) enforces at runtime. Authoring ≠ enforcement: relay writes the list; the runtime (deployment platform) enforces it.
- Registry entries are append-only records: deregistration is a new entry marked `revoked`, never a deletion.

## Rail 2 — Least-privilege default

- New agents and new tools start with the **minimum** access their registered purpose requires. Nothing inherits access by department, similarity, or convenience.
- Every grant is explicit, logged in the registry, and reviewed on a fixed audit cadence: `<FILL_IN: audit cadence, suggested quarterly>`.
- A grant nobody can justify at audit is revoked by default (revoke-then-appeal, not appeal-then-revoke).

## Rail 3 — No silent fleet changes (board-gated)

Any change to the fleet — a skill edit, a new or retired agent, a model change, a threshold change — follows one path, with **no autonomy tier for "small" changes** (operator decision, 2026-07-10):

1. The proposing agent (normally **anneal**) writes a **change proposal document**: what changes, why (evidence), the exact diff or spec, risk assessment, rollback.
2. The proposal routes to **board** (Governance Gate). board's triple-pass discipline applies.
3. Only after board approval is the change applied — versioned, with a before/after record. **precedent** archives the proposal + verdict.
4. An unapproved change discovered in the fleet is an incident: freeze, revert, escalate to operator.

## Rail 4 — Prototype cage

- Every experimental agent **proto** spins up runs sandboxed (Engineering Rail 2 applies), with registered-tools-only access and a hard expiry date: `<FILL_IN: default prototype lifetime, suggested 14 days — reasoning-based, not formula-verified>`.
- At expiry the verdict is explicit: **promote** (enters Rail 3's proposal path as a new-agent proposal) or **archive with learnings**. Silence = archive. Default-promote is forbidden.
- A prototype never touches production data, production memory layers, or unregistered tools.

---

## 5. Enforcement points

| Rail | Authored by | Enforced by |
|---|---|---|
| 1 — registry | relay | runtime plan-lock (Engineering Rail 1, quinn's control point) + relay's audits |
| 2 — least privilege | relay | relay's audit cadence; violations → operator |
| 3 — board gate | anneal (proposals) | board (verdict) · precedent (archive) · meta (only approved changes enter the registry/roster) |
| 4 — prototype cage | proto | quinn's sandbox policy (Engineering Rail 2) + expiry checks by gauge's cadence |

## 6. Adoption

Operator: fill every `<FILL_IN>`, then sign below. Until signed, agents treat this charter as **most-restrictive defaults** (everything above applies with the suggested values, and anything ambiguous resolves to "don't").

- Adopted by: `<FILL_IN: operator name>` · Date: `<FILL_IN>` · Amendments: append-only log below.

| Date | Amendment | Signed |
|---|---|---|
| — | — | — |
