# guard · tool requirements

> **This file states needs, not grants** (playbook §7). Listing tools here does NOT give guard that capability. Actual tool, file, and execution access is a runtime-configuration step done wherever guard is deployed.

---

## Aggregate

| Skill | Required | Optional | Source line |
|---|---|---|---|
| ip-routing | File read (config) | Web fetch (delegated) · Solve Intelligence MCP · Descrybe MCP · CourtListener MCP · Ticketing MCP (Jira/Linear/Asana) | Step 3 (config load); Step 5 (marketplace handoff uses these) |
| clearance | Web fetch · File write (memo output) | Solve Intelligence · Descrybe · CourtListener MCPs | Marketplace body — searches registries, writes memo per configured output location |
| oss-review | File read (manifests / repo) · Web fetch (license text verification) · File write (memo) | Ticketing MCP for OSS clearance workflow · SPDX/OSI reference MCPs | Marketplace body — parses manifests, reads license text, writes memo |
| infringement-triage | Web fetch (case law + registry lookup) · File write (memo) | CourtListener MCP · Solve Intelligence MCP | Marketplace body — factor walk needs case-law surfacing when available |
| ip-registry | File read/write | Web fetch (verify source URLs still resolve) · Domain registrar MCP · USPTO status API | Steps 1–5 mutate `registry.yaml`; Steps 6–7 read; optional tools auto-verify expiry |

---

## Runtime notes

- **Web fetch** is required by all 3 marketplace skills (registry + case-law + license-text lookups). Cascades to `ip-routing` since the wrapper delegates. If web fetch is not granted, marketplace skills fall back to "no database search was run" honest mode — still useful, but explicitly limited.
- **Solve Intelligence / Descrybe / CourtListener MCPs** are all Optional. When configured, they replace or supplement web fetch for TM / case-law lookups. When absent, the marketplace skills say so explicitly in the output (no silent fallback to model knowledge).
- **File writes** scoped: marketplace skills write memos to the output path in `guard-config.md`; `ip-registry` writes to `custom/ip-registry/registry.yaml`.
- **Python/shell execution** is **not required** by any guard skill currently. If a future logical script (e.g. `oss_license_classifier.py` from touch-2) enters `Shared OS/logical/`, `oss-review` would import it and require Python/shell then.

---

## Governance/policy layer

Permissions (what guard is *allowed* to do at runtime) live in `operational/agent/guard-config.md` (integrations table + approval chain). This file (technical layer) is intentionally separate, per playbook §7's split.
