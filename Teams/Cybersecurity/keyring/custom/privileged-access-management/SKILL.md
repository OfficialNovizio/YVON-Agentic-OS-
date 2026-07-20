---
name: privileged-access-management
type: custom
status: built 2026-07-10 (Fable)
based_on_catalog_entry: none — new; admin/root/break-glass discipline (plan §3)
marketplace_search: 2026-07-10 — PAM skills found are vendor-product (CyberArk/BeyondTrust) guides; the discipline is kept custom, just-in-time/zero-standing-privilege aligned (cited). No verbatim fit.
assigned_agent: keyring (Cybersecurity / Identity & Access Management)
portable: true
includes: (no asset — method skill)
date_added: 2026-07-10
---

# Privileged Access Management (PAM)

## Introduction
The tighter discipline for the accounts that can do the most damage — admin, root, cloud-org-owner, database-superuser, break-glass. Privileged access is minimized, just-in-time (granted for a task then removed), monitored, and never standing-by-default. These are the keys to the kingdom, and the kingdom's blast radius is why they get their own rules.

## Purpose
Standing admin access is how a single phished credential becomes a full compromise. PAM shrinks the privileged attack surface: fewer privileged accounts, granted only when needed, for only as long as needed, with every use watched — so a stolen credential is usually not privileged, and a privileged action is always visible.

## When to Use
- Any admin/root/superuser/org-owner access is involved.
- "Who has admin," "grant break-glass," "why is this a standing admin."
- Privileged-access review (stricter cadence than normal reviews).

## Structure / Protocol
MINIMIZE (fewest possible privileged accounts; no shared admin logins; personal accountability) → JUST-IN-TIME (privilege granted for a specific task and time window, then automatically removed — zero standing privilege where possible; operator/PAM-tool executes) → BREAK-GLASS (emergency high-privilege access is pre-defined, heavily logged, alerts on use, and reviewed after every use — not a always-on backdoor) → MONITOR (every privileged action logged and, ideally, session-recorded; feeds cortex detection) → REVIEW (privileged entitlements recertified on a short cadence; access-reviews, stricter) → keyring designs; operator/PAM-tool executes; break-glass use alerts cortex.

## Instructions
1. **Minimize and personalize.** As few privileged accounts as the work requires, each tied to a person (no shared `admin`/`root` logins — shared privilege destroys accountability). A privileged account that exists "just in case" is attack surface.
2. **Just-in-time over standing.** The goal is zero standing privilege: privilege is requested for a task, granted for a window, and auto-revoked. Standing admin is the exception that needs justification, not the default.
3. **Break-glass is defined, logged, alerted, reviewed.** Emergency access exists (you'll need it) but it's a pre-approved, heavily-monitored path that fires an alert on use and is reviewed every single time — never a quiet always-on super-account.
4. **Every privileged action is visible.** Logged and session-recorded where possible; these logs are prime cortex detection sources (privileged action outside a granted window = alert).
5. **Stricter, shorter reviews.** Privileged entitlements are recertified more often than normal access; the blast radius justifies the overhead.
6. **keyring designs; operator/PAM executes; break-glass alerts cortex.** The inversion holds even here — especially here, because privileged execution by a security agent would be the ultimate concentration of risk.

## Output Format
```
## Privileged Access: [account/entitlement]
Minimized: [personal, not shared ✓] · Model: [just-in-time window / standing (justified?)]
Break-glass: [defined · logged · alerts-on-use · post-review] (if applicable)
Monitoring: [logged/session-recorded → cortex] · Review cadence: [short]
Designed by keyring · executed by operator/PAM
```

## Principles
- **Minimize + personalize** — fewest privileged accounts, no shared admin.
- **Just-in-time over standing** — zero standing privilege is the goal.
- **Break-glass is defined, alerted, and post-reviewed** — not a quiet backdoor.
- **Every privileged action is visible** — prime cortex detection source.
- **Stricter, shorter reviews** — blast radius justifies it.
- **keyring designs; operator executes** — the inversion, hardest here.

## Fallback
- No PAM tooling → manual just-in-time (grant, task, prompt revoke) + a tightly-held, logged break-glass procedure, labeled manual; the discipline holds without the product.
- Legacy system requires standing admin → minimize, monitor heavily, and log it as a time-boxed exception with a compensating control (warden).

## Boundaries with Other Skills
- **identity-lifecycle / access-reviews** (siblings): privileged accounts get stricter JML and shorter reviews.
- **secrets-governance** (sibling): privileged credentials are the most sensitive secrets.
- **cortex**: privileged-action logs and break-glass alerts are prime detection inputs.
- **relay/quinn (Eng/AI&Agents)**: AGENT privilege is Rail 2 / relay's grants; keyring's PAM is for humans — parallel, not overlapping.
- **warden**: standing-privilege exceptions and PAM gaps are register risks.
