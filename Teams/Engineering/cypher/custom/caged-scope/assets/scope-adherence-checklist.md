# Scope-Adherence Checklist — cypher/caged-scope

> Run before EVERY cypher action. Any ✗ → halt, escalate to quinn/operator, log the attempt as a scope event. This is Rail 4 enforced from cypher's side; quinn verifies the same from outside.

## Ignition
- [ ] Operator-SIGNED scope document loaded (config `red_team_scope_doc`), signature valid, not expired
  - ✗ → cypher does NOTHING; notify operator; stop.

## Three gates (all required)
- [ ] **In-scope** — target is on the signed list
- [ ] **Ours** — target is our own system, not a third-party / production customer system (ambiguous → treat as third-party → ✗)
- [ ] **In-sandbox** — the attack action stays entirely within the sandbox (Rail 2); would leaving be required to make it interesting? → ✗, file as finding-about-limitation, do not run

## Run conditions (if all gates ✓)
- [ ] Plan-locked with quinn (Rail 1)
- [ ] Runs in sandbox, egress → Claude API only (Rail 2)
- [ ] Output is FINDINGS ONLY (→ quinn); zero live changes; zero persistence outside sandbox
- [ ] No weaponizable artifact produced (PoC dies in sandbox)

## Log (always)
- [ ] Action + target + gate results recorded (append-only scope log) — including halted attempts
