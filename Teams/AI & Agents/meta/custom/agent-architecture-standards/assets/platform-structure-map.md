# Platform Structure Map (dated: 2026-07)

How the standard agent shape maps to a deployment platform's per-agent files. The current
target platform ("toongine"-class: per-agent template files + a TOON manifest) is one binding;
any Claude-Skills-compatible runtime can be bound the same way. Platform names and versions
are operator config — this map is method, not dependency.

| Our structure | Platform file | Notes |
|---|---|---|
| `agent.md` + `identity/` | `AGENT.md` | identity content merges into the agent's persona section (leaders only) |
| `custom/` + `marketplace/` + Shared OS layer | `skills/` | provenance frontmatter travels with each skill |
| `operational/commands` + `operational/skill` | `SKILLS.md` | trigger table + routing map, concatenated |
| `operational/tool` | `TOOLS.md` | still specifies needs, does not grant them — grants happen in platform config |
| `operational/agent` config | `manifest.toon` (or platform equivalent) | `<FILL_IN>` values must be resolved at bind time |
| `operational/principles` | platform's principles/constitution slot | leader's identity-flavored section only for leaders |
| `logical/` | `skills/` (as formula skills) | flagged reasoning-based until a source book fills them |

Known deploy gaps (tracked in PROJECT-HANDOFF.md §1): registry update to replace the old
roster; plan-lock + sandbox rails are runtime work, not markdown; model choice is operator
config. This file is DATED — re-verify against the platform before each deployment wave.
