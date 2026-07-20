---
name: api-standards
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: api-standards (VYON_Skills_Catalog_Full_v2.html, raj/Engineering) — genericized per rule 0.4b; the specific framework/protocol comes from the stack-profile
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — REST/API-design skills found are framework-specific scaffolders; the contract discipline is kept custom, bound to the stack-profile and aegis's security review
assigned_agent: raj (Engineering / Backend & APIs)
portable: true — the contract dimensions are protocol-agnostic; REST/GraphQL/gRPC specifics come from the stack-profile
includes: assets/api-contract-checklist.md
date_added: 2026-07-09
---

## Introduction

api-standards is raj's contract discipline: every API the backend exposes has consistent authentication and authorization, explicit versioning, uniform error shapes, sane pagination, and contract tests that pin the shape so consumers don't break. The protocol (REST, GraphQL, gRPC) comes from the stack-profile; the discipline is the same regardless.

## Purpose

Inconsistent APIs are where integrations break and security holes open: one endpoint returns 200-with-error-body, another 500s; one checks authorization, the next forgot; a breaking change ships with no version bump and every client shatters. A written standard makes the API predictable — and predictable APIs are testable, secure, and safe to evolve.

## When to Use

Triggers: "design this endpoint," "API design," "how should errors look," "version this API," "is this a breaking change," "contract test," and any new or changed backend surface.

## Structure / Protocol

```
An API surface to design/change
  -> AUTH: authentication on every non-public route; AUTHORIZATION per-object (not just per-route)
  -> VERSIONING: explicit; a breaking change bumps the version, never mutates a live contract
  -> ERROR SHAPE: one consistent error envelope (code, message, detail) — never 200-with-error
  -> PAGINATION / limits: bounded responses; no unbounded list endpoints (DoS + cost)
  -> CONTRACT TESTS: pin request/response shape so consumers break at CI, not in production
    -> Security-relevant surface (auth, new external input) → aegis secure-code-review
      -> Shape reflects dana's data model; deep data access follows data-access-discipline
```

## Instructions

1. **Auth on every route; authorization per-object.** Authentication (who) on every non-public endpoint, and authorization (may they act on THIS object) checked per-resource — the IDOR hole aegis's review also hunts. An endpoint that authenticates but authorizes only at the route level is a finding.
2. **Version explicitly; breaking changes bump.** A change that removes a field, changes a type, or alters semantics is breaking and bumps the version — never mutate a live contract under existing clients. Additive changes (new optional field) are safe within a version.
3. **One error shape, always.** A single error envelope (stable machine-readable `code`, human `message`, optional `detail`) with correct status codes — never HTTP 200 wrapping an error, never leaking stack traces or internal structure (aegis's info-leak concern). Consumers handle errors uniformly or not at all.
4. **Bound every response.** List endpoints paginate; no endpoint returns unbounded data (it's a cost and DoS surface — cypher's L10). Limits are explicit and enforced server-side.
5. **Contract tests pin the shape.** Every endpoint has tests asserting its request/response contract, so a breaking change fails CI (quinn's gate) rather than a client in production. This is the API-layer answer to "agents say done" — the contract test proves the shape is real, not claimed.
6. **The shape reflects the data model.** API resources map to dana's schema; a contract that contradicts the model is an integration bug. Deep or N+1-prone data access follows data-access-discipline, not raw queries in the handler.

## Output Format

```
## API: [endpoint/surface] — [protocol per stack-profile]
Auth: [authn ✓ · authz per-object ✓] · Version: [v · breaking? bump]
Error shape: [consistent envelope ✓ · correct status] · Pagination: [bounded ✓]
Contract tests: [present, pin shape ✓] · Security review: [n/a / →aegis]
Data model fit: [reflects dana model ✓ / mismatch]
```

## Principles

- **Auth everywhere; authorization per-object** — the route-level-only check is the IDOR hole.
- **Version explicitly; breaking changes bump** — never mutate a live contract.
- **One error shape, correct status, no leakage** — uniform handling, no 200-wrapped errors.
- **Bound every response** — unbounded lists are cost + DoS surfaces.
- **Contract tests pin the shape** — breaking changes fail CI, not production clients.
- **The API reflects the data model** — contradictions are integration bugs.

## Fallback

- No stack-profile protocol yet → design REST-conventionally, flag the missing standard to dev; the discipline holds regardless of protocol.
- Breaking change genuinely unavoidable within a version → version bump + deprecation window + consumer notice, never a silent break.
- Legacy inconsistent endpoints → new endpoints follow the standard; legacy ones get a tracked debt entry, not a rewrite-everything mandate.

## Boundaries with Other Skills

- **service-patterns** (sibling): how the service behind the API behaves (idempotency, resilience); this is the contract at its edge.
- **data-access-discipline** (sibling): how handlers reach dana's stores without N+1 or Rail-3 violations.
- **aegis/secure-code-review**: auth/input surfaces route here for the security pass; the S-tier of quinn's gate.
- **dana**: the data model the API shape reflects; mismatches are joint fixes.
- **mia**: the frontend consumes these contracts; contract tests protect that boundary.
- **quinn**: contract tests are gate evidence; unbounded/unversioned endpoints are gate findings.
