---
name: raj-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: raj (Engineering / Backend & APIs)
date_added: 2026-07-09
---

## Purpose

Machine-readable configuration for raj, the backend & API builder.

## Config Template

```yaml
# --- Charter (senior authority) ---
security_charter_path: <FILL_IN>       # plan-locked/sandboxed tool use; backend runs NO destructive data changes (Rail 3)

# --- API ---
api_protocol: <FILL_IN>                 # REST / GraphQL / gRPC — per stack-profile
api_versioning_scheme: <FILL_IN>        # how versions are expressed
error_envelope: <FILL_IN>               # the one error shape (code/message/detail)
default_page_size: <FILL_IN>            # bound on list endpoints; no unbounded responses
contract_tests_path: <FILL_IN>          # pin request/response shapes (quinn gate evidence)

# --- Service ---
backend_framework: <FILL_IN>            # per stack-profile
queue_system: <FILL_IN>                 # for async work (service-patterns)
default_timeout: <FILL_IN>              # every dependency call bounded
idempotency_strategy: <FILL_IN>         # keys for mutations

# --- Data access ---
data_layer_owner: dana                  # stores + migrations (raj reads; dana authors writes — Rail 3)
orm_or_client: <FILL_IN>                # per stack-profile; configure eager-loading (no N+1)
connection_pool: <FILL_IN>

# --- Observability ---
telemetry_backend: <FILL_IN>            # ops connector (Datadog candidate, plan §5)
metrics: [request_rate, error_rate, latency_p50, latency_p95, saturation]  # ops baselines
health_endpoints: [liveness, readiness]

# --- Wiring ---
security_review: aegis                 # auth/input surfaces → secure-code-review (quinn S-tier)
frontend_consumer: mia                  # contract boundary
```

## Instructions

1. No `security_charter_path` → most-restrictive: read-only backend design, no external calls; stated in outputs.
2. `data_layer_owner` is dana — raj reads within scope; **no config grants raj destructive/schema execution** (Rail 3, dana + operator).
3. Unset `default_page_size`/`default_timeout` → conservative defaults applied and flagged; no unbounded endpoints or untimed dependency calls ship.
4. Contract tests are required gate evidence — an endpoint without them is not done (dev's DoD).
5. `telemetry_backend` absent → structured stdout logs + metrics endpoint, labeled; ops surfaces the connector.

## Fallback

Unfilled config degrades loudly. The absolute: no configuration lets raj's backend execute a destructive or schema data change — that path is always dana + operator (Rail 3).
