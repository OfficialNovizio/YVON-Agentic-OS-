---
name: api-design-principles
description: Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs. Use when designing new APIs, reviewing API specifications, or establishing API design standards.
provenance:
  source: marketplace — wshobson/agents (github.com/wshobson/agents, plugins/backend-development/skills/api-design-principles)
  adopted: 2026-07-10
  adaptations: >
    Imported with code examples condensed to representative patterns (full Python/FastAPI/Ariadne
    listings in source). Language/framework examples marked illustrative — real bindings via dev's
    stack-profile. Boundaries section added: raj's custom api-standards is the CONTRACT authority
    (auth, versioning policy, error shape, contract tests) — this skill supplies design richness
    (resource modeling, pagination patterns, GraphQL schema/DataLoader, HATEOAS). Conflicts resolve
    to api-standards. Method unchanged.
assigned_agent: raj (Engineering / Backend & APIs)
# yvon-compile metadata (auto-derived from skill content 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "REST and GraphQL design principles for intuitive, scalable, maintainable APIs."
triggers: [api design principles]
---

# API Design Principles

REST and GraphQL design principles for intuitive, scalable, maintainable APIs.

## When to Use This Skill

- Designing new REST or GraphQL APIs
- Refactoring existing APIs for better usability
- Reviewing API specifications before implementation
- Migrating between API paradigms (REST ↔ GraphQL)
- Optimizing APIs for specific consumers (mobile, third-party)

## Core Concepts

### RESTful Design

**Resource-oriented architecture:** resources are nouns (users, orders), never verbs; HTTP methods carry the action; URLs represent hierarchies; naming is consistent (plural nouns for collections).

**Method semantics:** `GET` retrieve (idempotent, safe) · `POST` create · `PUT` replace whole resource (idempotent) · `PATCH` partial update · `DELETE` remove (idempotent).

```
# Good: resource-oriented
GET    /api/users              # list (paginated)
POST   /api/users              # create
GET    /api/users/{id}         # fetch
PATCH  /api/users/{id}         # partial update
DELETE /api/users/{id}         # delete
GET    /api/users/{id}/orders  # nested resource

# Bad: action-oriented
POST /api/createUser · POST /api/getUserById
```

### GraphQL Design

Schema-first: types define the domain model; queries read, mutations write, subscriptions stream. Clients request exactly what they need through one strongly-typed endpoint.

### Versioning Strategies

URL (`/api/v1/users`) · header (`Accept: application/vnd.api+json; version=1`) · query param. **Which strategy a business uses is set in raj's `api-standards`** — this skill just catalogs the options. Plan for breaking changes from day one.

## REST Patterns

**Pagination + filtering:** every collection endpoint takes `page`/`page_size` (bounded, e.g. max 100) plus typed filter params; responses carry `items, total, page, pages` so clients can derive has-next/has-prev.

**Errors + status codes:** one structured error shape everywhere — `error, message, details, timestamp, path` — with correct codes (400 validation, 401/403 auth, 404 missing, 409 conflict, 422 unprocessable, 5xx server). The canonical shape lives in `api-standards`; validation errors enumerate per-field problems.

**HATEOAS (optional):** responses embed `_links` (self, related resources, allowed actions) so clients navigate by hypermedia instead of hard-coded URLs. Adopt only if the consumer benefits — it's a trade-off, not a default.

## GraphQL Patterns

**Schema design:** explicit object types with relationships; Relay-style cursor pagination (`Connection`/`Edge`/`PageInfo`/`totalCount`); enums for closed value sets; custom scalars (`DateTime`, `Money`); mutations take `input` types and return payload types carrying `errors: [Error!]` for structured failure.

**Resolvers:** paginate with cursors (fetch limit+1 to derive `hasNextPage`); validate inputs at schema AND resolver level; return errors in mutation payloads, not thrown exceptions.

**DataLoader (N+1 prevention):** batch per-request loaders keyed by ID — one query for N parents' children, results mapped back to input order. Any list field resolving a relationship needs one. (Runtime N+1 symptoms → dana's `db-performance`, joint fix.)

## Best Practices

**REST:** plural-noun collections · stateless requests · correct status codes · version from day one · always paginate · rate-limit · OpenAPI/Swagger docs.

**GraphQL:** schema before resolvers · DataLoaders everywhere · structured mutation errors · cursor pagination (Relay spec) · `@deprecated` directive for gradual migration · track query complexity + execution time.

## Common Pitfalls

Over/under-fetching (REST — GraphQL fixes it but requires DataLoaders) · unversioned breaking changes · inconsistent error formats · missing rate limits · POST for idempotent operations · **API structure mirroring the database schema** (couples consumers to internals — model the domain, not the tables).

## Boundaries with other skills

- **api-standards (raj, custom):** the CONTRACT authority — auth-everywhere, versioning policy, the one error shape, bounded responses, contract tests. This skill informs design; api-standards decides. Conflicts → api-standards.
- **service-patterns (raj):** resilience behind the contract (idempotency, timeouts, breakers, queues).
- **data-access-discipline (raj) / db-performance (dana):** N+1 and read-shaping at the data layer; DataLoader is this skill's edge-side half of that fix.
- **data-modeling (dana):** the domain schema APIs should express — without mirroring storage.
- **git-workflow-and-versioning (dev):** semver judgment for API-visible changes (Hyrum's Law: observed behavior = contract).
- **stack-profile (dev):** binds framework examples (FastAPI/Express/Ariadne/etc.) per business.
- **Security Charter:** senior; API authn/authz gaps found in review route to aegis.
