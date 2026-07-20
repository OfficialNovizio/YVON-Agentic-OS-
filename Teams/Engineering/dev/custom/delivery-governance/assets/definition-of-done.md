# Definition of Done — dev/delivery-governance

> A change is DONE only when every box is checked. A claim of "done" with unchecked boxes is
> returned with the gaps named. The operator may explicitly accept a gap as logged tech debt —
> the agent never silently downgrades "done."

## The gates (all required)

- [ ] **Reviewed** — code-review-standards passed (correctness → security → tests → style)
- [ ] **Tested** — quinn's required tiers present; assertions meaningful; fragile-area regression if applicable
- [ ] **Gated** — quinn's release gate green (tiers + regression + Reticle verdicts / Playwright suite)
- [ ] **Secured (if risky)** — new external surface / auth / data path → aegis passed
- [ ] **Charter-clean** — external-tool calls plan-locked (Rail 1); no agent-run destructive DB op (Rail 3); sandbox respected (Rail 2)
- [ ] **Documented** — ADR if an architecture decision was made; stack-profile updated if the stack changed
- [ ] **Rollback-ready** — ops confirms a tested rollback exists (no deploy without one)

## Tech-debt register (append-only)

| Date | What was deferred | Why | Risk | Trigger to fix |
|---|---|---|---|---|

## Branching / merge

[Per stack-profile. Default if unset: PR + review + green gate + linear/revertable history.]
