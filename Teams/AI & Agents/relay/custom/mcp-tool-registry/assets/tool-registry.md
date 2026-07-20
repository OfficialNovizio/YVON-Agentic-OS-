# Fleet Tool Registry — seeded 2026-07-10 (append-only)

Entries below are the tools **proposed as connectors at deployment** by prior department builds
(PROJECT-HANDOFF §5 tooling map) — registered as `trial` until the operator connects and adopts
them. Grants are least-privilege: only the named agents. Egress = declared domains only.

| Tool | Kind | Source | Auth | Owner | Scopes | Agents granted | Egress | Status | Date |
|---|---|---|---|---|---|---|---|---|---|
| Reticle | MCP | github.com/reticlehq/reticle | `<FILL_IN>` | quinn | edit-gate verification | quinn | `<FILL_IN>` | trial | 2026-07-10 |
| Playwright | MCP | playwright.dev | `<FILL_IN>` | quinn | release-gate browser tests | quinn | `<FILL_IN>` | trial | 2026-07-10 |
| defending-code-reference-harness | repo/script | github.com/anthropics | n/a (local) | aegis | native-code vuln pipeline | aegis, cypher | NONE | trial | 2026-07-10 |
| Agentation | MCP | agentation.com | `<FILL_IN>` | mia | UI annotation feedback | mia | `<FILL_IN>` | trial | 2026-07-10 |
| claude-seo | plugin | github.com/AgriciDaniel/claude-seo | n/a (local) | rank | technical SEO sub-skills | rank | NONE | trial | 2026-07-10 |
| HelixDB | database | github.com/helixdb/helix-db | `<FILL_IN>` | dana | datastore (reads; writes via Rail 3 scripts) | dana | `<FILL_IN>` | trial | 2026-07-10 |
| Harness.io | MCP | mcp registry | `<FILL_IN>` | ops | CI/CD | ops | `<FILL_IN>` | trial | 2026-07-10 |
| Datadog | MCP | mcp registry | `<FILL_IN>` | ops | telemetry read | ops, gauge (read-only metrics) | `<FILL_IN>` | trial | 2026-07-10 |

## History (append-only)
- 2026-07-10 · registry seeded by relay at department build from PROJECT-HANDOFF §5. All entries trial; `<FILL_IN>` auth/egress resolved by operator at connection time. gauge added read-only on Datadog for fleet metrics (scorecard input).
