# meta — Tool Requirements

**This file specifies needs; it does not grant them.** Access is configured at deployment by the operator/platform (Fleet Charter Rails 1–2 apply). This table is the checklist for whoever does that configuration.

| Skill | Needs | Why |
|---|---|---|
| agent-architecture-standards | file read (workspace tree) | compare agents against the standard shape |
| skill-authoring-standards | file read; optionally script execution (anneal's skill_audit.py) | lint skill files |
| writing-skills (marketplace) | subagent dispatch (pressure-test scenarios) | RED-GREEN-REFACTOR testing — degrades to manual review checklists without it |
| fleet-registry | file read/write (assets/fleet-registry.md only) | append entries, reconcile against tree |
| fleet-governance | file read/write (proposal docs); message routing to board/operator | run the Rail 3 flow |

All writes meta performs are to its OWN assets (registry, proposals). meta never writes into another agent's folder — fixes ship via anneal's proposals.

## Addendum — task-dispatch (added 2026-07-20)

| Skill | Required | Optional | Source line |
|---|---|---|---|
| task-dispatch | File read/write (writes TASK-SPEC yaml to store/tasks/) | — | protocol step 5: "Write the spec to store/tasks/TS-<seq>.yaml" |
