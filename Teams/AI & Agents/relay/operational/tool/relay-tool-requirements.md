# relay — Tool Requirements

**This file specifies needs; it does not grant them.** Access is configured at deployment (operator/platform; Fleet Charter Rails 1–2 apply).

| Skill | Needs | Why |
|---|---|---|
| mcp-tool-registry | file read/write (own assets/); script execution (registry_lint.py) | maintain + validate the registry |
| least-privilege-grants | file read (other agents' SKILL.md files) | verify skill-line citations |
| egress-allowlist-authoring | file read/write (own exports); handoff channel to quinn | derive + deliver versioned allowlists |
| integration-patterns | file read (tool docs, registry) | reliability reviews |

relay needs NO network access of its own and NO access to any external tool it registers — it is bookkeeping and authoring only. That asymmetry is deliberate.
