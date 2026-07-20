---
name: backend-observability
type: custom
status: built 2026-07-09 (Fable build — 4th skill; the backend's contribution to ops's reliability)
based_on_catalog_entry: none — new; the instrumentation that makes ops's incident-response and maintenance-hygiene possible from the backend side
marketplace_search: 2026-07-09 — observability skills found are vendor-specific (OpenTelemetry/Datadog setup); the discipline is kept custom, bound to ops's baselines and the charter's no-secrets-in-logs
assigned_agent: raj (Engineering / Backend & APIs)
portable: true — the discipline is tool-agnostic; the telemetry backend comes from the stack-profile / ops playbook
includes: (no asset — method skill)
date_added: 2026-07-09
---

## Introduction

backend-observability is how raj makes services debuggable in production: structured logs, request tracing, meaningful metrics, and health/readiness endpoints — so that when something breaks (ops's incident-response) there's a trail to follow, and so "normal" is measurable (ops's baselines). An unobservable service is one where every incident starts from zero.

## Purpose

The worst production incidents are the ones you can't see: no logs at the failure point, no trace across services, no metric that showed the slow creep before the cliff. Observability is paid for before the incident — instrument now, or debug blind later. It's also what makes ops's monitoring baselines and quinn's release verification possible.

## When to Use

Triggers: "add logging," "why can't we debug this," "health check," "tracing," "what metrics," "instrument this," and any new service or endpoint (observability is built in, not bolted on).

## Structure / Protocol

```
A service/endpoint
  -> STRUCTURED LOGS: machine-parseable, with correlation/request IDs — NEVER secrets/PII (charter)
  -> TRACING: a request traceable across service boundaries (correlation ID propagated)
  -> METRICS: the ones ops baselines on — request rate, error rate, latency (p50/p95), saturation
  -> HEALTH: liveness (am I up) + readiness (can I serve — deps reachable) endpoints
    -> Feeds ops: baselines (maintenance-hygiene), incident signal (incident-response),
       deploy verification (release-discipline)
```

## Instructions

1. **Structured, correlated logs — never secrets.** Logs are machine-parseable (not just prose), carry a request/correlation ID so a request is traceable, and NEVER contain secrets, tokens, or PII (the charter's and aegis's rule — a secret in a log is a breach). Log at the boundaries and the failure points, not everywhere (noise buries signal).
2. **Trace across boundaries.** Propagate a correlation ID through service calls so a single request's path is reconstructable — the difference between "the checkout is slow somewhere" and "the checkout is slow in the tax service." Essential once service-patterns splits work across services.
3. **Metrics ops can baseline.** Emit request rate, error rate, latency percentiles (p50/p95 — averages hide the tail), and saturation. These ARE ops's maintenance-hygiene baselines and release-discipline's verification signals; without them, "is it healthy" has no answer.
4. **Health and readiness are different.** Liveness (the process is up) and readiness (it can actually serve — dependencies reachable, pool available) are distinct; a service that's live but not ready should not receive traffic (ops's deploy verification depends on this distinction).
5. **Instrument at build time.** Observability is part of "done" (dev's definition), not a post-incident retrofit. A new endpoint ships with its logs, metrics, and health contribution — retrofitting instrumentation during an incident is debugging blind.
6. **Signal over noise.** More logs is not more observability; the right logs at the right points beat a firehose. Excessive logging is its own cost (storage, and the L10 surface) and buries the line that matters.

## Output Format

```
## Observability: [service/endpoint]
Logs: [structured ✓ · correlation ID ✓ · NO secrets/PII ✓ · boundary+failure points]
Tracing: [correlation propagated across deps ✓]
Metrics: [rate · error rate · latency p50/p95 · saturation → ops baselines]
Health: [liveness + readiness endpoints ✓]
```

## Principles

- **Structured, correlated logs — never secrets/PII** (charter + aegis).
- **Trace across boundaries** — a request's whole path, not one service's guess.
- **Metrics ops can baseline** — rate/error/latency-percentiles/saturation; p95, not just average.
- **Liveness ≠ readiness** — a live-but-not-ready service takes no traffic.
- **Instrument at build time** — observability is part of done, not a retrofit.
- **Signal over noise** — the right logs beat a firehose; excess is cost and an L10 surface.

## Fallback

- No telemetry backend bound → structured logs to stdout + a metrics endpoint, method-only, labeled; connector adoption (Datadog, plan §5) surfaced to the operator via ops.
- Legacy service unobservable → add health + error/latency metrics first (the incident essentials), then broaden; prioritized by what ops's last incident couldn't see.
- Pressure to log everything "to be safe" → refused; scoped logging at boundaries/failures, because noise that buries signal is worse than a gap.

## Boundaries with Other Skills

- **ops/maintenance-hygiene**: consumes the metrics as baselines; **ops/incident-response**: consumes logs/traces as the debugging trail; **ops/release-discipline**: consumes health for deploy verification.
- **service-patterns** (sibling): traced boundaries align with service boundaries.
- **aegis**: no-secrets-in-logs is aegis's and the charter's rule; a leaked secret in a log is a finding.
- **cypher**: excessive logging/unbounded work is an L10 surface.
- **quinn**: observability is part of dev's definition of done, which quinn gates.
