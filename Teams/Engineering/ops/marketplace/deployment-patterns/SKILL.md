---
name: deployment-patterns
description: Deployment workflows, CI/CD pipeline patterns, Docker containerization, health checks, rollback strategies, and production readiness checklists for web applications.
provenance:
  source: marketplace — affaan-m/everything-claude-code (ECC), skills/deployment-patterns
  adopted: 2026-07-10
  adaptations: >
    Imported as the strategy/mechanics companion release-discipline already credits ("strategy
    patterns credited to marketplace"). Platform-specific snippets (Dockerfiles, GitHub Actions,
    K8s probes, Vercel/Railway commands) are DATED examples per ops's platform-playbooks volatility
    split — bind real ones per business. VYON overlays: deploys require quinn GATE PASS + tested
    rollback (release-discipline preconditions); DB migration rollback is dana-authored,
    operator-run (Rail 3). Boundaries added; conflicts resolve to release-discipline.
assigned_agent: ops (Engineering / DevOps & Reliability)
volatility: tool/platform syntax dated 2026-07 — re-verify playbook snippets >6 months old
# yvon-compile metadata (auto-derived from skill content 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "Production deployment workflows and CI/CD best practices."
triggers: [deployment patterns]
---

# Deployment Patterns

Production deployment workflows and CI/CD best practices.

> **VYON preconditions (senior):** nothing here runs until release-discipline's gates are green — quinn GATE PASS, charter verdict, rollback exercised FIRST. Database steps inside any deploy are dana-authored scripts the OPERATOR runs (Rail 3).

## When to Activate

Setting up CI/CD pipelines · dockerizing an application · choosing a deployment strategy · implementing health checks/readiness probes · preparing a production release · environment configuration.

## Deployment Strategies

### Rolling (default)
Replace instances gradually; old and new run simultaneously during rollout.
**Pros:** zero downtime, gradual. **Cons:** two versions live at once — changes must be backward-compatible (pairs with dana's expand-contract). **Use:** standard, backward-compatible deploys.

### Blue-Green
Two identical environments; traffic switches atomically; old side becomes standby.
**Pros:** instant rollback (switch back), clean cutover. **Cons:** 2× infrastructure during deploy. **Use:** critical services, zero tolerance.

### Canary
Small traffic percentage to the new version first (5% → 50% → 100% as metrics hold).
**Pros:** real-traffic validation before full rollout. **Cons:** needs traffic splitting + monitoring. **Use:** high-traffic services, risky changes, feature flags.

## Docker (dated examples — bind per business via platform-playbooks)

**Multi-stage pattern (any language):** deps stage → build stage → minimal runtime stage; non-root user; only production artifacts copied; `HEALTHCHECK` instruction; pinned base-image versions. Source carries full Node 22 / Go 1.22 / Python 3.12 Dockerfiles — copy from upstream when a business adopts one.

**Good practices:** specific version tags (never `:latest`) · multi-stage to minimize size · non-root user · dependency files copied first (layer caching) · `.dockerignore` (node_modules, .git, tests) · HEALTHCHECK · resource limits.
**Bad:** root user · `:latest` · whole-repo single COPY · dev deps in prod image · **secrets in the image** (env vars / secrets manager only).

## CI/CD Pipeline

**Stages:**
```
PR:            lint → typecheck → unit → integration → preview deploy
Merge to main: lint → typecheck → unit → integration → build image
               → deploy staging → smoke tests → deploy production
```

GitHub Actions reference pipeline in source (test job → build+push image tagged by SHA → environment-gated deploy job); Harness.io is the proposed connector per ops's tooling map — either way the pipeline enforces: no deploy job without the test job green, production behind an environment gate, images traceable to a commit SHA.

## Health Checks

- **Liveness** (`/health`): cheap 200/ok — is the process alive.
- **Detailed/readiness** (`/health/detailed`): checks each dependency (DB, cache, external APIs), returns 503 + per-check status when degraded, includes version + uptime. Endpoint implementation is raj's `backend-observability`; ops consumes it for probes and monitors.
- **K8s probes (dated example):** livenessProbe (30s period, 3 failures) · readinessProbe (10s, 2 failures) · startupProbe (5s × 30 = 150s max startup).

## Environment Configuration

**Twelve-factor:** all config via environment variables, never in code; secrets injected by a secrets manager; explicit `APP_ENV`. **Validate config at startup and fail fast** (schema-validate the env: required URLs, minimum secret lengths, enumerated environments) — a misconfigured deploy should die at boot, not at first request.

## Rollback Strategy

Instant rollback mechanics (dated examples): `kubectl rollout undo` · `vercel rollback` · redeploy previous SHA. **DB rollback is never a platform command** — reversible migrations are dana-authored, operator-run (Rail 3).

**Rollback checklist (feeds release-discipline's rollback-exercised-FIRST rule):**
- [ ] Previous image/artifact available and tagged
- [ ] DB migrations backward-compatible (no destructive changes in-flight)
- [ ] Feature flags can disable new features without a deploy
- [ ] Alerts configured for error-rate spikes
- [ ] Rollback tested in staging before the production release

## Production Readiness Checklist

**Application:** all test tiers pass · no hardcoded secrets · error handling covers edges · structured JSON logs, no PII · meaningful health endpoint.
**Infrastructure:** reproducible pinned image builds · env vars documented + validated at startup · resource limits · scaling bounds · TLS everywhere.
**Monitoring:** request rate/latency/error metrics exported · error-rate alerts · log aggregation · uptime checks on health endpoint.
**Security:** dependency CVE scan (aegis's pipeline) · CORS allowlist · rate limiting on public endpoints · authn/authz verified · security headers (CSP, HSTS, X-Frame-Options).
**Operations:** rollback plan documented AND tested · migrations tested at production scale · runbooks for common failures · escalation path defined.

## Boundaries with other skills

- **release-discipline (ops, custom):** the AUTHORITY — gate preconditions, rollback-first, deploy checklist, expand-migrate-contract sequencing. This skill supplies strategy/mechanics; conflicts resolve to release-discipline.
- **platform-playbooks (ops):** every platform-specific snippet here (Docker, Actions, K8s, Vercel) lives operationally as a dated per-business playbook; this file is the pattern source.
- **maintenance-hygiene (ops):** monitoring baselines, dependency/CVE cadence, backup restore-testing.
- **incident-response (ops):** when a deploy breaks — roll back first, diagnose second; post-mortem feeds regression-map.
- **migration-discipline + database-migrations (dana):** DB phases inside deploys — dana authors, operator runs, ops sequences.
- **backend-observability (raj):** owns the health/metrics endpoints this skill probes.
- **test-strategy (quinn):** GATE PASS is a precondition; smoke tests in the pipeline are quinn-defined tiers.
- **Security Charter:** senior to everything here.
