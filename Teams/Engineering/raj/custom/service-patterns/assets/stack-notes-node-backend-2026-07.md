# Stack Notes — Node.js Backend Patterns (dated 2026-07)

**Applies only when the business's stack-profile names Node.js (Express / Next.js API routes).** Method authority: `service-patterns` + `api-standards` (conflicts resolve there). Source: affaan-m/everything-claude-code `backend-patterns`, adopted 2026-07-10, condensed. Rail 3 unchanged: no destructive data access from the backend, ever.

## Layering
- **Repository pattern:** data access behind an interface (`findAll/findById/create/update/delete`) — swap stores without touching business logic; the store itself comes from dana + stack-profile.
- **Service layer:** business logic composed over repositories; no SQL/store calls in route handlers.
- **Middleware pipeline:** auth (`withAuth` wrapper verifying bearer token → `req.user`), logging, rate limiting as composable wrappers, not inline in handlers.

## Data access (raj's data-access-discipline governs)
- Select only needed columns, never `select('*')`.
- N+1: batch-fetch by collected IDs into a Map — one query, not one per row.
- Multi-write consistency: real transactions (DB function/RPC) — never sequential writes hoping for the best. Transaction *scripts* that mutate schema/data are dana-authored (Rail 3).

## Caching
Cache-aside with TTL (check cache → miss → fetch → `setex`) · explicit invalidation on write · decorator repository (`CachedMarketRepository` wrapping the base repo) keeps caching out of business logic.

## Errors
Typed `ApiError(statusCode, message)` + one centralized handler mapping: ApiError → its status · validation error → 400 with details · unknown → log + generic 500 (never leak internals). Retry with exponential backoff (1s/2s/4s, capped attempts) for transient upstream failures.

## AuthN/AuthZ (api-standards owns the contract; aegis reviews the surface)
JWT verification helper throwing 401 on missing/invalid · role→permission map with `requirePermission(...)` HOF wrapping handlers (403 on insufficient).

## Rate limiting (critical note)
**Shared store only** (Redis / gateway / platform limiter). Per-process in-memory counters fail in production: reset on deploy, split across replicas, fail open in serverless.

## Background work
Slow work goes to a queue; the endpoint returns "queued" immediately. In-memory queue only for single-instance dev — production queues per stack-profile (e.g. BullMQ, SQS).

## Logging
Structured JSON with `requestId`/`userId` context, error+stack captured — feeds `backend-observability` (its rules on secrets/PII apply).
