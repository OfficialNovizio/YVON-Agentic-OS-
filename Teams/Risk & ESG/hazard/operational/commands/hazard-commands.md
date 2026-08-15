# hazard — Commands

> Invocation patterns for hazard. Non-leader — reports up to pilot.

## Direct Invocations

Per skill phase (see `operational/skill/hazard-skill-routing.md` for triggers).

## Coordination Commands

| Command | Coordinates with |
|---|---|
| `hazard → pilot: risk data + monitoring input` | pilot |
| `hazard → prism: ESG risk overlap` | prism |
| `hazard → shield: operational-resilience risk overlap` | shield |
| `hazard → sentinel: three-lines audit coordination` | sentinel (Governance) |
| `hazard → warden: cyber GRC coordination` | warden (Cybersecurity) |
| `hazard → precedent: prior-decision precedent` | precedent (Governance) |
| `hazard → operator + broker + counsel: insurance-transfer` | operator + broker + counsel |

## Escalation Commands

| Trigger | Escalate to |
|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP |
| Risk-inventory gap pressure | operator + pilot |
| Qualitative-only scoring pressure | operator + CRO |
| Material-risk treatment without sign-off | operator + counsel |
| Audit-trail integrity issue | sentinel + operator + counsel |

## Not Available

- `hazard: risk strategy` → pilot
- `hazard: ESG reporting` → prism
- `hazard: BCP / DR / third-party` → shield
- `hazard: internal audit execution` → sentinel
- `hazard: individual crisis support` → manager + HR Ops + EAP

## Compile Behavior

Per §14.2.

## Audit Notes

- Last audit: 2026-07-31 (this build).
