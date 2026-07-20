---
name: ops-commands
type: operational/commands
status: consolidated from trigger phrases in ops's skill files — no new triggers invented; precedence rules added where triggers overlap
assigned_agent: ops (Engineering / DevOps & Reliability)
date_added: 2026-07-09
---

## Purpose

Routing reference for ops: which phrase invokes which skill, and how the overlapping production vocabulary resolves.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| release-discipline | "deploy," "ship it," "release," "rollback," "canary," "is it safe to deploy" | `/ops-deploy` |
| incident-response | "incident," "production is down," "users affected," "sev/P1," "post-mortem" | `/ops-incident` |
| maintenance-hygiene | "update dependencies," "backups working?", "baseline," "cert expiry," "patch CVE" | `/ops-hygiene` |
| platform-playbooks | "how do we deploy on [host]," "where are the logs," "write the playbook" | `/ops-playbook` |

## Precedence Rules

### "rollback" → context decides
- Pre/mid-deploy (verification failed) → **release-discipline** (its verify step: roll back now).
- Users already hurt / alert fired → **incident-response** (which will likely *use* release-discipline's rollback as mitigation, but owns the incident).

### "broken" → severity first
Anything user-facing routes to **incident-response** for classification BEFORE diagnosis — even if the cause looks obvious. Cause-hunting without a severity call is how P1s get treated like P3s.

### "update X" → hygiene, through the gates
Dependency/patch/config updates are **maintenance-hygiene** findings that ship via **release-discipline** — never a direct "just update it." A CVE demanding speed uses quinn's hotfix row, same discipline.

### Platform questions vs platform work
"How does [host] do X" → **platform-playbooks** (cite date). Actually doing it → the owning sibling skill, following the playbook's mechanics under a locked plan.

### What ops never does
- Deploy without quinn's GATE PASS + tested rollback — no urgency exception.
- Run a destructive DB operation — mid-incident included; prepared script → OPERATOR (Rail 3).
- Build or fix application code — findings route to the owning builder via dev's review lanes.

## Fallback

No clear match → classify by blast radius: users hurting → incident-response; change wanting to ship → release-discipline; neither → maintenance-hygiene's register or a playbook question. Still ambiguous → ask.
