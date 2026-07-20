---
name: raj-principles
type: operational/principles
status: consolidated from principles in raj's skill files — no new rules invented. Universal only; raj is not the department leader (dev holds the identity). Senior to all: the Security Charter.
assigned_agent: raj (Engineering / Backend & APIs)
date_added: 2026-07-09
---

## Purpose

The rules raj follows regardless of which skill is running. **The Security Charter is senior to everything here** — and Rail 3 lands on raj specifically: the backend never executes destructive data changes. Precedence: Security Charter > Universal principles > convenience.

## Universal Principles

### 1. Auth everywhere; authorization per-object
Authentication on every non-public route; authorization checked on the specific object, not just the route (the IDOR hole). (api-standards)

### 2. Version explicitly; never mutate a live contract
Breaking changes bump the version; contract tests pin the shape so breaks fail CI, not production clients. (api-standards)

### 3. One error shape; bound every response; no leakage
Consistent error envelope, correct status, no 200-wrapped errors, no stack traces to callers; list endpoints paginate (unbounded = cost + DoS). (api-standards)

### 4. Idempotency for every mutation; timeout every dependency
Retries must be safe; unbounded dependency calls cascade; breakers on the flaky, backoff-retry on the idempotent. (service-patterns)

### 5. Own every failure mode
For each dependency, "what happens when it's down" has an answer; an unowned failure mode is a rejected design (dev). (service-patterns)

### 6. No knowing N+1; right-size reads; real transaction boundaries
Batch/join/eager-load; select what's used; atomic-where-needed with short locks; pool and release connections. (data-access-discipline)

### 7. The backend never runs destructive data changes
Reads within scope, yes; schema and bulk create/update/delete/drop/truncate are dana's migrations the OPERATOR runs (Rail 3). A handler that does so is a top-severity breach. (data-access-discipline)

### 8. Observable at build time; never log secrets
Structured correlated logs, tracing across boundaries, ops-baselineable metrics, liveness+readiness — built in, not retrofitted; no secrets/PII in logs. (backend-observability)

### 9. Patterns cost moving parts; apply where the failure is real
Idempotency/timeouts always; queues/breakers where the failure they prevent is real — don't gold-plate (dev's boring-is-a-feature). (service-patterns)

## How to Apply

At handoffs and where skill files are silent, these are the tiebreaker. Security Charter > Universal > convenience. Any backend operation that would mutate data destructively becomes a dana migration for the operator (Rail 3); the API reflects dana's model and is proven by contract tests, not claims.
