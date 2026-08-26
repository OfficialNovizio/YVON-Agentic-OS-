---
name: dispute-log
type: custom
status: built from scratch
assigned_agent: shield (Legal & Compliance / Litigation & Disputes)
portable: true
date_added: 2026-07-29
tier: 3
description: "Live registry of active and closed disputes — pre-litigation demand, litigation, arbitration, regulatory action. Status · exposure estimate · response-deadline tracker · external-counsel routing. Genericised from vyon-dispute-log per §0.4b — no hardcoded jurisdiction, no hardcoded venue. Overdue response deadlines never auto-defer."
triggers:
  - dispute status
  - legal threat
  - we got sued
  - we got a demand letter
  - regulatory action against us
  - open disputes
  - list our disputes
  - what disputes do we have
  - log this dispute
  - register this demand letter
  - update dispute [slug]
  - close dispute
  - upcoming response deadlines
  - what's overdue
  - dispute exposure summary
---

# Dispute Log

## Introduction

Built from scratch on 2026-07-29 as shield's live dispute registry. Sits alongside `case-assessment-memo` (marketplace): the memo skill produces case-level analytical output for a single dispute; this skill owns the state across the full portfolio — what disputes exist, what's the response-deadline calendar, what's the aggregate exposure.

Genericised from the catalog's `vyon-dispute-log`, which had a specific jurisdiction and dollar threshold hardcoded. This skill is jurisdiction-parametric and threshold-configured via `shield-config.md`.

## Purpose

Own the state around the organisation's disputes:

- Which disputes exist (pre-litigation demand / active litigation / arbitration / regulatory action / IP dispute / employment claim).
- Which venture / entity the dispute is against.
- Counterparty and their counsel.
- Venue (court, tribunal, regulator).
- Current status (demand received / answer due / discovery / motion / trial / appeal / settled / dismissed / judgment).
- Exposure estimate (reasoned range from `case-assessment-memo` output; not a raw plaintiff ask).
- Response deadlines with alert thresholds — never auto-defer overdue.
- External counsel routing (if engaged) with matter number.
- Insurance-carrier notification status (if applicable per policy).
- Reserved amounts (for accounting purposes — reference only; actual GL entries are `Finance & Treasury` domain when that dept is built).
- Milestone history.

State lives at `disputes.yaml`. Slugs are stable across the dispute lifecycle.

## When to Use

- Operator says "log this dispute" · "register this demand letter" · "we got sued" · "we got a demand letter" · "regulatory action against us" · "legal threat".
- Operator asks "dispute status" · "open disputes" · "list our disputes" · "what disputes do we have" · "dispute exposure summary".
- Operator says "update dispute [slug]" · "close dispute" · "settled" · "dismissed".
- Operator asks "upcoming response deadlines" · "what's overdue".
- `case-assessment-memo` completes → the exposure range and disposition recommendation feed into a dispute-log update.

Do NOT use for:

- Case-level analytical memo — that's `case-assessment-memo` (marketplace).
- Contract terms that gave rise to the dispute — those live in `scribe`'s `contract-library`; the dispute log references the contract slug.
- Regulatory obligation that the dispute is about — the regime lives in `comply`'s `obligation-register`; the dispute log references the obligation slug.
- IP asset that the dispute is over — the asset lives in `guard`'s `ip-registry`; the dispute log references the asset slug.

## Structure / Protocol

```
LOG           operator supplies dispute → validate → assign slug → append to disputes.yaml
UPDATE        status change / new milestone / exposure re-estimate → bump revision → keep prior row
CLOSE         settled / dismissed / judgment / withdrawn → mark closed with disposition
ATTEST        quarterly review confirms disputes still active + exposure current
RETRIEVE      lookup by slug / venture / venue / status / counterparty / owner / next-due
CALENDAR      list upcoming response deadlines within a horizon window
EXPOSURE      aggregate exposure across active disputes for reporting
```

## Instructions

### Step 1: Log a new dispute

Operator supplies (never invent — ask if missing):

- **slug** — short kebab-case (e.g., `acme-breach-2026-06`, `state-ag-inquiry-2026-07`, `former-emp-noncompete-2026-08`)
- **dispute_type** — `pre-litigation-demand` / `litigation-active` / `litigation-answered` / `arbitration` / `regulatory-action` / `ip-dispute` / `employment-claim` / `insurance-coverage-dispute`
- **counterparty** — name + counsel (if known)
- **venture_scope** — one or more ventures, or `org-wide`
- **jurisdiction** — governing law
- **venue** — specific court / tribunal / arbitration seat / regulator (e.g., "US District Court, Northern District of California", "AAA arbitration, San Francisco seat", "SEC Enforcement Division")
- **description** — plain-language, one paragraph
- **claims_asserted** — list of causes of action
- **defenses_raised** — list (if we're defending) or `N/A` (if we're plaintiff)
- **current_status** — demand received / answer due / discovery / motion pending / trial-set / on-appeal / etc.
- **received_date** — YYYY-MM-DD (when the demand letter / complaint / notice arrived)
- **next_response_due** — YYYY-MM-DD (the next hard deadline)
- **exposure_range** — reasoned range from `case-assessment-memo` (e.g., "$50K-$180K") — do NOT accept a raw plaintiff ask; if no assessment yet, `pending case-assessment`
- **external_counsel** — firm + matter number, or `none / handling in-house`
- **insurance_notified** — yes/no + carrier + policy number (if applicable per `shield-config.md` insurance table)
- **related_contract_slug** — cross-reference to `scribe/contract-library` if a contract is at issue
- **related_obligation_slug** — cross-reference to `comply/obligation-register` if a regulatory obligation is at issue
- **related_ip_slug** — cross-reference to `guard/ip-registry` if an IP asset is at issue
- **owner** — internal owner (name, role, or handoff-agent)
- **source_documents** — links to the demand letter / complaint / regulatory notice

Append to `disputes.yaml`. Slug must be unique per counterparty+jurisdiction+dispute_type tuple.

### Step 2: Update

- Operator supplies changed fields + a **reason** (status change, new milestone, exposure re-estimate, external counsel change).
- Bump `revision`.
- Add a new row; mark prior row `superseded_by=<new revision>` and `status=archived`. Do not delete.
- If `next_response_due` moves, log both the new date and the old date + who authorised the extension.

### Step 3: Close

Disposition reached:

- Set `status=closed` with `closure_type` (settled / dismissed / judgment-for-us / judgment-against-us / withdrawn / non-suited / regulatory-action-closed).
- Record `closure_date`, `final_terms` (settlement amount / judgment / order + any injunctive terms), and `closure_evidence` (settlement agreement / order + dismissal / regulator letter).
- Keep row + all history. Retention per `shield-config.md` litigation-hold policy.
- Route `closed-with-payment` events to `Finance & Treasury` (when built) for GL entry; today, note in the row for later reconciliation.

### Step 4: Attest (quarterly)

Cadence per `shield-config.md`'s `Review cadence` field (default quarterly). On invocation:

- List every active dispute with next-response-due + days-to-deadline.
- Flag any where `exposure_range` is stale (> 90 days since last case assessment).
- Route overdue response deadlines → **auto-escalate L3 to `Governance/board`** (per `shield-config.md`), regardless of the operator's involvement level.
- Produce a review pack: exposure aggregate, deadline-cliff view, external-counsel matters, insurance-notified status.

Never attest on behalf of anyone — presenting state, not signing off (§0.5).

### Step 5: Retrieve

- **By venture** → active + closed disputes affecting venture X.
- **By venue** → all disputes in a specific court / tribunal / regulator.
- **By status** → active vs answered vs discovery vs motion vs on-appeal.
- **By counterparty** → repeat-litigant pattern detection.
- **By owner** → all disputes owned by role/agent.
- **By related contract/obligation/IP** → cross-agent joins.
- **Overdue** → disputes past `next_response_due`.

### Step 6: Calendar

Given a horizon window (default 30 days per `shield-config.md`):

- Sorted table (nearest deadline first).
- Colour-tagged by bucket (🔴 overdue · 🟠 ≤7d · 🟡 ≤14d · 🟢 ≤30d).
- Days-to-deadline, owner, external-counsel matter number.

### Step 7: Exposure aggregate

For an at-a-point-in-time exposure view:

- Sum the `low` and `high` ends of each active dispute's `exposure_range` (never sum plaintiff-asks).
- Bucket by dispute_type and by venture.
- Return low/mid/high totals with per-dispute contribution called out.
- Cross-reference `insurance_notified` — flag disputes with material exposure and no insurance notification.

## Output Format

- **Log / update / close / attest** → confirmation line + resulting `disputes.yaml` row echoed.
- **Retrieve** → table matching query type.
- **Calendar** → sorted deadline table with colour tags.
- **Exposure** → aggregate table (low / mid / high) with per-dispute breakdown.

## Principles

- **No invented disputes.** Every row comes from a real source document (demand letter, complaint, regulatory notice) with a link (playbook §0.5).
- **No inventing exposure.** Exposure ranges come from `case-assessment-memo` output or from a real settlement offer / demand paired with the counter-analysis. Never a raw plaintiff ask.
- **Never delete history.** Superseded, closed rows all stay. Retention per litigation-hold policy.
- **Overdue response deadlines never auto-defer.** Halt, escalate L3 to `Governance/board`. A missed deadline is a substantive event, not paperwork.
- **Attestation is a signed act.** Named human owner (playbook §0.7).
- **One active revision per (slug, counterparty, jurisdiction, dispute_type) tuple.** Updates archive the prior row.
- **Every citation carries a provenance tag.** `[demand letter received]`, `[complaint filed]`, `[regulator notice]`, `[case-assessment-memo]`, `[external counsel]`, `[web search — verify]`, `[model knowledge — verify]`, `[user provided]`. Never strip.
- **Insurance notification is a hard checklist item.** If policy requires notification, an "insurance_notified: no" state on an active dispute is a defect flagged in every attestation until resolved.

## Fallback

| Failure mode | Response |
|---|---|
| Required log field missing | Ask; never invent |
| Slug collision on (counterparty, jurisdiction, dispute_type) | Present existing row + ask: update existing, or new related dispute? |
| Response deadline passed | Halt; auto-escalate L3; do not silently defer |
| Exposure range stale > 90 days | Flag; recommend re-running `case-assessment-memo` |
| Retrieve with no active match | Return `not found`; do not substitute |
| Disputes file corrupted | Halt; do not auto-repair |
| Quarterly attest shows > 2 overdue | Systemic failure — halt, escalate `board` |

## Boundaries with Other Skills

- **`case-assessment-memo` (marketplace, this agent)** — one-way: memo generates exposure range + disposition; `dispute-log` records those into the state. Log entries missing an exposure range flag "pending case-assessment."
- **`scribe/contract-library` (Legal & Compliance)** — related_contract_slug references the template the contract at issue is based on. If a pattern of disputes emerges on a template, the pattern goes to `scribe` for template revision.
- **`comply/obligation-register` (Legal & Compliance)** — regulatory actions cross-reference the applicable regime obligation.
- **`guard/ip-registry` (Legal & Compliance)** — IP disputes cross-reference the asset slug; a pattern of disputes on the same asset informs `guard`'s enforcement-posture calibration.
- **`Governance/precedent`** — a dispute's resolution may establish an internal ruling; that ruling goes to `precedent` for consistency (not held here).
- **`Governance/board`** — L2/L3 escalations per `shield-config.md` + fixed L3 auto-triggers (overdue deadlines, exposure above threshold, always-L3 dispute types like class actions).
- **`Cybersecurity/warden`** — disputes involving data-breach or security-incident allegations link to `warden`'s incident-response records for evidence.
- **`Finance & Treasury` (when built)** — settled / judgment payments route for GL entry.
- **Shared OS: `verification-before-completion`** — inherited before any `disputes.yaml` commit.

## Tool declaration (technical, not permission)

Per playbook §7 (`operational/tool/`), this list declares *technical needs*, not permission grants.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| dispute-log | File read/write | Web fetch (verify source URLs; court docket check) · Court-docket MCP (CourtListener, PACER via API) | Steps 1–4 mutate `disputes.yaml`; Steps 5–7 read; optional tools auto-verify docket status |
