# API Contract Checklist — raj/api-standards

> Run per endpoint/surface. Protocol specifics (REST/GraphQL/gRPC) from the stack-profile; these are invariant.

## Auth
- [ ] Authentication on every non-public route
- [ ] Authorization checked PER-OBJECT, not just per-route (IDOR guard)
- [ ] Secrets/tokens never in URLs, logs, or error bodies

## Versioning
- [ ] Version explicit
- [ ] Breaking change (removed field / type change / semantic change) → version bump, live contract not mutated
- [ ] Additive-only changes stay within version

## Error shape
- [ ] Single error envelope (code · message · detail), stable machine-readable code
- [ ] Correct status codes; never 200-wrapping-an-error
- [ ] No stack traces / internal structure leaked to untrusted callers

## Bounds
- [ ] List endpoints paginate; no unbounded responses (cost + DoS / cypher L10)
- [ ] Limits enforced server-side

## Contract tests (quinn gate evidence)
- [ ] Request + response shape pinned by tests
- [ ] Breaking change fails CI, not a production client

## Integration
- [ ] Resource shape reflects dana's data model
- [ ] Deep/N+1-prone access → data-access-discipline (not raw queries in handler)
- [ ] Security-relevant surface → aegis secure-code-review
