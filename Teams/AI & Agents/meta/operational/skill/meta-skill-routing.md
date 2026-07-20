# meta — Skill Routing Map

Identity note (leader): empirical-gardener governs HOW meta communicates; this file governs WHICH skill runs WHEN. Law (charter/playbook) overrides both.

## Flow
```
request
  │ "allowed?" ──────────────► fleet-governance ──► (charter answer, or proposal path)
  │ "compliant?" (structure) ► agent-architecture-standards ─┐
  │ "compliant?" (skill file) ► skill-authoring-standards ───┤ violations → route to anneal
  │ authoring/adopting ──────► skill-authoring-standards → writing-skills (test) → fleet-governance (propose)
  │ roster/lifecycle ────────► fleet-registry
  └ change of any kind ──────► fleet-governance (Rail 3) → fleet-registry (record)
```

## Handoffs out of meta
- Violations needing a fix → **anneal** (drafts the fix proposal).
- Verdicts → **board**; archives → **precedent**.
- New capability wanted → **relay** (registration) before anyone uses it.
- Behavior-affecting change applied → **gauge** (re-measure) closes the loop.
- Prototype questions → **proto** (Rail 4 cage is proto's, promotion standard is meta's).

## Precedence
fleet-governance wins ties (a governance question outranks a bookkeeping one); fleet-registry never decides, only records.

## Machine-Readable Routing (compiled)

```yaml
# yvon-compile: machine-readable routing — prose above remains canonical for humans
skills:
  task-dispatch:
    handoffs: entry point for all multi-agent work — discovery once, spec to store/tasks/, workers receive shards only; architecture standards govern builds, dispatch governs work
```
