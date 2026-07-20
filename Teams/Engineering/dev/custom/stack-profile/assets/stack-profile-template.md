# [Business Name] Stack Profile — TEMPLATE

> The single source of truth for what this business is built with. Filled from CURRENT reality
> (aspirational entries labeled). Every Engineering agent reads it. Stack changes are ADRs
> (dev/architecture-decisions) that update this file with a version bump. Saved at dev's config
> `stack_profile_path`.

**Business:** [name] · **Version:** [v1.0] · **Updated:** [YYYY-MM-DD] · **Last change ADR:** [ADR-NNN]

## Languages & runtimes
[e.g., TypeScript 5.x (Node 20), Python 3.12, Dart 3.x — with versions]

## Frontend (web)
- Framework: [e.g., Next.js 15 / React 19 / Vue / Astro]
- Host: [e.g., Vercel / Cloudflare / self-hosted]
- Styling / tokens: [design-token source — bridges to atlas's brand kit via mia]
- Conventions: [server-first components, composition over drilling, etc.]

## Backend & APIs
- Runtime/framework: [e.g., Node/Fastify, Go, Rails]
- API style: [REST / RPC / GraphQL] · Error shape: [documented shape] · Versioning: [scheme]
- Auth model: [e.g., JWT + session, OAuth provider]

## Data
- Primary datastore: [e.g., Postgres / MySQL]
- Graph/vector (if any): [e.g., **HelixDB** — if adopted, note the ADR]
- Cache/queue: [Redis / SQS / …]
- Migration tool: [and: migrations are operator-run per Security Charter Rail 3]

## Mobile
- [Flutter / React Native / native — or "none (web-only)"; sets nova's `mobile_active`]

## Hosting / infra / CI-CD
- Cloud: [AWS / GCP / Vercel / …] · IaC: [Terraform / …]
- CI/CD: [GitHub Actions / **Harness.io** / …]
- Monitoring: [**Datadog** / Sentry / …] · Backups: [cadence + restore-test policy per ops]

## Bound connectors (deployment)
[Which MCP/API connectors are actually wired: Reticle, Playwright, Agentation, claude-seo,
HelixDB, Harness, Datadog… — tool skills read this to know what exists.]

## Security-relevant surface (aegis/cypher read this)
[Auth surfaces, external inputs, third-party integrations, secret stores, in-scope red-team targets pointer]

## Conventions index
[Pointers to where naming/error/test conventions live, so all agents share one source.]

## Change log
| Date | v | Change | ADR |
|---|---|---|---|
