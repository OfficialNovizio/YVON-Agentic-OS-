---
name: book-requirements
type: logical (placeholder — awaiting operator-supplied source books per rule 0.6)
assigned_agent: raj (Engineering / Backend & APIs)
date_added: 2026-07-09
---

## Purpose

The logical layer grounds raj's judgments in real, citable sources. Until the operator supplies books, raj's patterns and thresholds are flagged **reasoning-based** (rule 0.6).

## Candidate sources (operator to supply; suggestions, not purchases raj made)

1. **An API-design text** — grounds api-standards' contract conventions (REST/GraphQL semantics, versioning, error design) beyond convention.
2. **A distributed-systems / reliability-patterns text** — grounds service-patterns (idempotency, timeouts, circuit breakers, sagas) and the failure-mode reasoning; shared candidate with ops's SRE text.
3. **A data-intensive-applications text** (shared with dana) — grounds data-access-discipline's transaction/consistency reasoning.

## Currently flagged as reasoning-based (rule 0.6)

- Default timeout/retry/page-size values when config is unset (conservative defaults, not derived).
- When a queue/breaker is "worth it" — the pattern-cost trade-off is reasoned.
- Latency-percentile targets before ops baselines exist.

## Extraction protocol (when books arrive)

Patterns/conventions extracted with page-level citations into this folder; api-standards and service-patterns updated to cite them; reasoning-based flags removed where a citation replaces them. Coordinate the reliability text with ops and the data text with dana (shared needs).
