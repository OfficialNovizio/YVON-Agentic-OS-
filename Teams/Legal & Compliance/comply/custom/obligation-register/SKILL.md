---
name: obligation-register
type: custom
status: built from scratch
assigned_agent: comply (Legal & Compliance / Compliance Lead — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Live matrix of compliance obligations — venture × regime × jurisdiction × obligation. Register / update / retire / attest / quarterly-review. Genericised from vyon-compliance-matrix (playbook §0.4b) — no hardcoded venture, no hardcoded regulator. Feeds precedent and warden when obligations change."
triggers:
  - are we compliant
  - compliance check
  - add this obligation
  - register this obligation
  - update this obligation
  - retire this obligation
  - what obligations apply to venture X
  - what obligations apply in jurisdiction Y
  - obligation attestation
  - quarterly obligation review
  - what's on the register
---

# Obligation Register

## Introduction

Built from scratch on 2026-07-29 as comply's live compliance matrix. Sits alongside `reg-monitor-routing`: the routing skill detects new obligations from regulator feeds; this skill owns the state of what's currently on comply's books.

Genericised from the catalog's `vyon-compliance-matrix`, which had one venture and one country's statutes (PIPEDA, GST/HST, CBCA) hardcoded (playbook §0.4b). The register here is generic: venture, regime, jurisdiction are all dimensions, none are hardcoded.

## Purpose

Own the state around comply's compliance obligations:

- Which obligations exist (identifier + short slug).
- Which venture (or "org-wide") they apply to.
- Which regulatory regime they arise under (GDPR / PIPEDA / CCPA / SOX / HIPAA / ISO 27001 / etc.).
- Which jurisdiction the regime is anchored to.
- What the ongoing action is (report cadence, retention period, breach notification window, etc.).
- Who owns each obligation internally (control owner in `warden`, contract owner in `scribe`, or comply itself).
- Attestation status (last attested + next due).
- Retirement conditions (regime superseded / venture wound down).

State lives at `register.yaml`. Slug identifiers are stable across attestations.

## When to Use

- Operator asks "are we compliant with X?" · "compliance check" · "what obligations apply to venture X" · "what obligations apply in jurisdiction Y".
- Operator says "add this obligation" · "register this obligation" · "update this obligation" · "retire this obligation".
- Operator triggers a quarterly review: "quarterly obligation review" · "obligation attestation".
- `reg-monitor-routing` surfaces a "always material" item that creates a new obligation — the operator commits to the register via this skill.

Do NOT use for:

- Discovering new obligations from feeds — that's `reg-monitor-routing`.
- Assessing whether a *proposed feature* triggers a new obligation — that's `regulated-activity-readiness`.
- Control design (SOC 2 evidence, breach-response runbook) — that's `warden` in Cybersecurity; the register just records the commitment.
- Contract-level compliance clauses — that's `scribe`.

## Structure / Protocol

```
REGISTER      operator supplies obligation → validate → assign slug → append to register.yaml
UPDATE        operator supplies change + reason → bump revision → keep prior row for audit
ATTEST        operator (or delegate) confirms obligation still met → record date + owner
RETIRE        regime supersedes / venture winds down → mark retired; keep row
REVIEW        quarterly (or ad-hoc): list all obligations with attestation-status
RETRIEVE      lookup by slug / venture / regime / jurisdiction / owner / next-due
```

## Instructions

### Step 1: Register a new obligation

Operator supplies (never invent — ask if missing):

- **slug** — short kebab-case (e.g., `gdpr-art30-records-of-processing`, `sox-404-controls-attestation`, `pipeda-breach-notification-72h`)
- **regime** — the regulatory regime (GDPR / SOX / HIPAA / ISO 27001 / venture-specific licence / etc.)
- **jurisdiction** — where the regime is anchored (EU / US-federal / US-CA / CA-federal / UK / …)
- **venture_scope** — one or more ventures, or `org-wide`
- **obligation_type** — one of: reporting · attestation · retention · breach-notification · disclosure · registration · audit · training · other
- **description** — plain-language, one paragraph, what has to be done
- **cadence** — how often (one-time / annual / quarterly / on-trigger / continuous)
- **next_due_date** — YYYY-MM-DD (or `null` for continuous)
- **owner** — internal owner (name, role, or handoff-agent like `warden`, `scribe`)
- **source_citation** — the actual regulator + article / section number (e.g., "GDPR Art. 30", "SOX §404(b)")
- **source_url** — link to primary source (regulator site preferred)

Append to `register.yaml`. Slug must be unique for (venture_scope, regime, jurisdiction) tuple.

### Step 2: Update an existing obligation

- Operator supplies changed fields + a **reason** (regulator amendment, scope expansion, control-owner change).
- Bump `revision` counter.
- Add a new row; mark the prior row `superseded_by=<new revision>` and `status=archived`. Do not delete.

### Step 3: Attest

Attestation confirms an obligation is currently being met. Attestor supplies:

- Obligation slug + current revision
- Attestation date
- Attesting owner
- Evidence link (audit trail, control test output, filing receipt, contract clause, etc.)
- Any exceptions (a partial-attestation — some sub-obligation is not currently met and there is a remediation plan)

Update the row's `last_attested`, `next_due`, and `evidence` fields. If exceptions were recorded, also open a `remediation` block with owner + due date.

### Step 4: Retire

Regime superseded (e.g., PSD2 replaced by PSD3), venture wound down, or obligation genuinely no longer applies:

- Set `status=retired` with `retired_date` and `retired_reason`.
- Keep row + evidence trail. Retirement is not deletion.

### Step 5: Quarterly review

Cadence per `comply-config.md`'s `Review cadence` field (default quarterly). On invocation:

- List every active obligation with attestation-status (attested / due within 30 days / overdue).
- Cluster by owner for accountability.
- Flag remediation items past their due date.
- Route overdue items above `comply-config.md` L2 threshold → `Governance/board`.
- Produce a review pack for the operator.

Do not attest on behalf of anyone in this step — presenting the state, not signing off (playbook §0.5).

### Step 6: Retrieve

- **By venture** → all obligations that apply to venture X, with attestation status.
- **By regime** → all obligations under GDPR / SOX / etc., across ventures.
- **By jurisdiction** → all obligations anchored in jurisdiction Y.
- **By owner** → all obligations owned by role/agent.
- **Upcoming** → obligations with `next_due` in the next N days.

Return only what's asked; do not summarise the whole register in prose unless requested.

## Output Format

- **Register / update / retire** → confirmation line + the resulting `register.yaml` row echoed.
- **Attest** → confirmation + updated row (attestation date, next-due, evidence link).
- **Quarterly review** → table per owner, active/due-soon/overdue split, remediation flags.
- **Retrieve** → table format matching the query type.

## Principles

- **No invented obligations.** Every row comes from a real regulator citation supplied by the operator. If the source is not primary (regulator site, statute text), flag with `[secondary source]` and require primary-source substantiation on next update (playbook §0.5).
- **Never delete history.** Superseded, retired, and amended rows all stay in `register.yaml` — the audit trail is the point.
- **Attestation is a signed act.** Only a named human owner attests; the skill never marks an obligation attested on its own inference (playbook §0.7).
- **One active revision per (slug, venture_scope, regime, jurisdiction) tuple.** Updates archive the prior row before promoting the new one.
- **Every citation carries a provenance tag.** `[<regulator>]`, `[secondary source]`, `[user provided]`, `[web search — verify]`, `[model knowledge — verify]`. Never strip.
- **Missing evidence blocks attestation.** An attestation without a linked evidence artifact is refused, not shipped with a `<FILL_IN>`.

## Fallback

| Failure mode | Response |
|---|---|
| Required registration field missing | Ask the operator; do not defer or invent |
| Slug collision on (venture, regime, jurisdiction) | Present the existing row + ask: update it, or is this a genuinely distinct new obligation? |
| Attestation with no evidence link | Refuse; require link |
| Retrieve has no active match | Return `not found`; do not substitute related obligations |
| Register file corrupted | Halt; do not attempt auto-repair |
| Quarterly review shows > 20% overdue | Halt review, surface pattern, escalate to `Governance/board` — this is a systemic failure, not a rows-review |

## Boundaries with Other Skills

- **`reg-monitor-routing` (custom, this agent)** — one-way: routing surfaces new items; register commits them once operator classifies. This skill does not run feed pulls.
- **`regulated-activity-readiness` (custom, this agent)** — one-way: readiness checks may add new obligations to the register (once the operator confirms the activity is going ahead). Readiness assesses; register records.
- **`scribe` (Legal & Compliance)** — obligations that require contractual clauses (data-processing addenda, subprocessor lists, breach-notification wording) route to `scribe` for template + review.
- **`warden` (Cybersecurity)** — obligations that require an internal control (SOC 2 evidence, access-review cadence, breach-readiness runbook) route to `warden` — this register records the commitment, `warden` designs and tests the control.
- **`Governance/precedent`** — when an internal ruling on an obligation is made (e.g., "we accept residual risk here" or "we scope out venture Y"), the ruling goes to `precedent` for consistency; the register records the current state.
- **`Governance/board`** — L2/L3 escalations per `comply-config.md` Escalation matrix.
- **Shared OS: `verification-before-completion`** — inherited before any commit to `register.yaml`.

## Tool declaration (technical, not permission)

Per playbook §7 (`operational/tool/`), this list declares *technical needs*, not permission grants.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| obligation-register | File read/write | — | Steps 1, 2, 3, 4 all mutate `register.yaml`; Step 5, 6 read it |
