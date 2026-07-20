---
name: ops-tool-requirements
type: operational/tool
status: specifies needs, does not grant them — grants happen at deployment via config/connectors
assigned_agent: ops (Engineering / DevOps & Reliability)
date_added: 2026-07-09
---

## Purpose

What ops needs to operate at full capability, and what happens without each. Every external tool call ops makes is plan-locked (Rail 1) and sandboxed, egress-allowlisted (Rail 2) — deploys included.

## Requirements

| Need | Tool / access | Used by | Without it |
|---|---|---|---|
| CI/CD pipeline control (build, deploy, rollback triggers) | per stack-profile; **Harness.io** MCP candidate (plan §5) | release-discipline | Manual deploys per playbook mechanics, checklist still mandatory, degraded loudly |
| Telemetry / alerting (baselines, incident detection) | per stack-profile; **Datadog** MCP candidate (plan §5) | maintenance-hygiene, incident-response | Human-report detection (logged as a contributing factor every incident); baselines from logs/synthetic checks, labeled partial |
| Hosting/platform control plane | per stack-profile (host CLI/API via playbook) | release-discipline, platform-playbooks | Method-only guidance; operator executes manually per playbook |
| Backup service access (trigger restore tests to scratch envs) | per stack-profile | maintenance-hygiene | Restore tests become operator-run tasks on cadence; unverified backups flagged as such |
| Dependency/CVE scanning | per stack-profile CI or a scanner connector | maintenance-hygiene | Manual advisory review on cadence, labeled partial; joint triage with aegis when built |
| Append-only record access | deploy records · incident log · maintenance register (config paths) | all | Affected skill stops issuing completion claims; loud degradation |
| Staging / scratch environments | per stack-profile | release-discipline (rollback exercise), maintenance-hygiene (restore tests) | Production-shaped ephemeral envs, labeled; the gap itself is infrastructure debt, flagged |

## Explicit non-needs (by design)

- **No destructive database access — not even mid-incident.** Data changes are dana-authored prepared scripts the OPERATOR runs (Rail 3). ops sequences them; it never executes them.
- **No application-code write access** — findings route to the owning builder; ops ships and observes, it doesn't patch code.
- **No egress beyond the allowlist** — deploy tooling's network needs are named in each playbook's Charter notes and operator-approved (Rail 2).

## Notes

- Connector adoption is surfaced to the operator at deployment (plan §5 pattern); every skill degrades to method-only per its fallback section.
- New tooling enters via a playbook update + this file + config — under a locked plan, never ad hoc.
