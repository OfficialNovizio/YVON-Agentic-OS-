---
name: ip-registry
type: custom
status: built from scratch
assigned_agent: guard (Legal & Compliance / IP Protection)
portable: true
date_added: 2026-07-29
tier: 3
description: "Live inventory of the organisation's IP assets — trademarks (registered + common-law), domains, patents (utility + design), copyrighted works, and code IP (repos + OSS attribution obligations). Register / update / renew / retire / attest. Genericised from vyon-ip-registry per §0.4b — no hardcoded venture, no hardcoded jurisdiction. Renewal calendar with alert thresholds."
triggers:
  - what IP do we own
  - list our trademarks
  - list our domains
  - list our patents
  - IP registry
  - IP inventory
  - add this trademark
  - register this trademark filing
  - register this domain
  - register this patent
  - IP renewal calendar
  - what's coming up for renewal
  - retire this IP asset
---

# IP Registry

## Introduction

Built from scratch on 2026-07-29 as guard's live inventory of the organisation's IP assets. Sits alongside `ip-routing`: the routing skill runs clearance / OSS / infringement analyses against *external* IP; this skill owns the state of *our own* IP.

Genericised from the catalog's `vyon-ip-registry`, which was one venture with one jurisdiction hardcoded. This skill is asset-type × jurisdiction × status dimensional, all parametric.

## Purpose

Own the state around the organisation's IP:

- Which IP assets exist (trademarks, domains, patents, copyrights, code IP).
- Which venture / entity owns each.
- Which jurisdiction each is registered / enforceable in.
- Filing / registration status.
- Renewal calendar with alert thresholds.
- Ownership chain (assignment history for patents; recordation for trademarks).
- OSS attribution obligations for code IP (bundled NOTICE files owed).
- Retirement / abandonment status.

State lives at `registry.yaml`. Slugs are stable across renewals.

## When to Use

- Operator asks "what IP do we own", "list our trademarks", "list our domains", "list our patents", "IP registry", "IP inventory".
- Operator says "add this trademark", "register this [trademark filing / domain / patent]", "renew this asset", "retire this asset".
- Operator asks "IP renewal calendar", "what's coming up for renewal".
- `ip-routing` completes a clearance for a *new* mark — after operator adoption, the mark is added to the registry.
- `ip-routing` completes an infringement triage that surfaces one of our marks needing enforcement — the registry entry is annotated with the enforcement status.

Do NOT use for:

- Clearance / OSS / infringement analysis — that's `ip-routing`.
- Contract terms about IP (assignment / license / warranty) — that's `scribe`.
- Regulatory regimes affecting IP (data protection, export controls) — that's `comply`.

## Structure / Protocol

```
REGISTER      operator supplies IP asset → validate → assign slug → append to registry.yaml
UPDATE        operator supplies change + reason → bump revision → keep prior row for audit
RENEW         due date reached → operator confirms renewal action → update effective/expiry
RETIRE        abandoned / no longer defended → mark retired; keep row
ATTEST        annual review confirms status → record date + owner
RETRIEVE      lookup by slug / type / jurisdiction / owner / next-due
CALENDAR      list upcoming renewals within a horizon window
```

## Instructions

### Step 1: Register an IP asset

Operator supplies (never invent — ask if missing):

- **slug** — short kebab-case (e.g., `apexleaf-us-cl25`, `nexushome-eu-cl9`, `patent-us-11234567`, `domain-example-com`)
- **asset_type** — one of: `trademark-registered` / `trademark-common-law` / `domain` / `patent-utility` / `patent-design` / `copyright-registered` / `copyright-unregistered` / `trade-secret-marker` / `code-ip`
- **jurisdiction** — where registered / enforceable (US / EU / UK / Madrid / specific country; N/A for global-scope code IP)
- **owner_entity** — which legal entity holds title (org-wide / specific subsidiary / venture)
- **filing_number** — USPTO reg no., EU trademark no., domain registrar record, patent number
- **filing_date** — YYYY-MM-DD
- **effective_date** — when protection took effect
- **expiry_date** — when protection lapses if not renewed (null for perpetual copyright, N/A for trade secret marker)
- **classes** — Nice classes for trademarks, patent classification for patents, N/A for others
- **description** — one paragraph
- **source_url** — link to the primary record (USPTO TESS, EUIPO, patent office, registrar)
- **enforcement_status** — active / watch-only / not-enforcing / disputed
- **oss_attribution_obligations** — for `code-ip` type: which NOTICE files are owed, per which dependency

Append to `registry.yaml`. Slug must be unique for (asset_type, jurisdiction, owner_entity) tuple.

### Step 2: Update

- Operator supplies changed fields + reason (assignment, jurisdiction extension, class expansion, redesign).
- Bump `revision`.
- Add a new row; mark prior row `superseded_by=<new revision>` and `status=archived`. Do not delete.

### Step 3: Renewal

`registry.yaml` maintains renewal alerts. On operator invocation OR when this skill is scheduled:

1. Compute days-to-expiry for every active row.
2. Bucket:
   - **Overdue** (past expiry) — halt further-analysis; auto-escalate L3 per `guard-config.md` Escalation matrix; do not silently defer.
   - **Due soon** (≤30 / ≤60 / ≤90 days per config alert thresholds) — surface to operator with recommended action.
   - **Fine** — no output unless requested.
3. For due-soon items, present the renewal instructions (per jurisdiction — trademarks and patents have jurisdiction-specific renewal windows and fees).
4. Operator confirms renewal action; skill records renewal date + new expiry + evidence (filing receipt, payment confirmation).

### Step 4: Retire

Asset intentionally abandoned (no longer defended / market exit / superseded by successor mark) or lapsed:

- Set `status=retired` with `retired_date`, `retired_reason`, and `successor_slug` (if any).
- Keep row + all history. Retirement is not deletion.

### Step 5: Attest

Annual (or per `guard-config.md` cadence) confirmation that each active asset is still owned + enforced. Attestor supplies:

- Slug + current revision
- Attestation date + owner
- Evidence link (filing / renewal receipt / recent enforcement action)
- Any exceptions (e.g., asset owned but not being enforced against known infringer — remediation plan)

### Step 6: Retrieve

- **By asset_type** → all trademarks (or domains / patents / etc.).
- **By jurisdiction** → all IP registered in jurisdiction X.
- **By owner_entity** → all IP held by venture Y.
- **By slug** → single asset with full history.
- **Overdue / due-soon** → renewal-calendar view.
- **By enforcement_status** → all actively enforced / all watch-only.

### Step 7: Calendar

Given a horizon window (default 90 days per `guard-config.md`), list every upcoming renewal with:

- Days-to-expiry
- Recommended lead time for renewal filing (per jurisdiction)
- Owner responsible
- Estimated cost (from `guard-config.md` cost table if maintained)

## Output Format

- **Register / update / renew / retire / attest** → confirmation line + resulting `registry.yaml` row echoed.
- **Retrieve** → table format matching query type.
- **Calendar** → sorted table (nearest expiry first), colour-tagged by bucket (🔴 overdue · 🟠 ≤30 · 🟡 ≤60 · 🟢 ≤90).
- **Inventory** → grouped by asset_type; totals by jurisdiction.

## Principles

- **No invented IP.** Every row comes from an operator-supplied real filing / registration / domain record with a source URL (playbook §0.5).
- **Never delete history.** Superseded, retired, and amended rows all stay in `registry.yaml`. Chain of title is the audit trail.
- **Attestation is a signed act.** Named human owner; never marked attested on skill inference (playbook §0.7).
- **One active revision per (slug, asset_type, jurisdiction, owner_entity) tuple.** Updates archive the prior row before promoting.
- **Overdue renewals never auto-defer.** Halt, surface, and escalate L3 — a lapsed mark is not a paperwork issue, it's a rights-loss event.
- **Every source URL must open the actual record** — not a summary, not a blog. The URL is what proves the asset exists.

## Fallback

| Failure mode | Response |
|---|---|
| Required field missing | Ask; do not defer or invent |
| Slug collision on (type, jurisdiction, owner) | Present existing row + ask: update, or genuinely new asset? |
| Renewal past expiry | Halt; auto-escalate L3; do not silently defer |
| Retrieve with no active match | Return `not found`; do not substitute similar |
| Registry file corrupted | Halt; do not auto-repair |
| Calendar shows > 20% of assets overdue | Systemic failure — halt review, escalate to `board` |

## Boundaries with Other Skills

- **`ip-routing` (custom, this agent)** — one-way: routing produces clearance / infringement outputs; registry records the outcome (new adoption, enforcement flag) once the operator commits.
- **`clearance` (marketplace)** — no direct handoff. `clearance` produces a memo; if operator adopts the mark, they register it via `ip-registry`.
- **`oss-review` (marketplace)** — one-way: `oss-review` may generate NOTICE-file requirements; `ip-registry` records them under `code-ip` type with `oss_attribution_obligations` field.
- **`infringement-triage` (marketplace)** — no direct handoff. `infringement-triage` may flag one of our marks as needing enforcement; the operator annotates the `enforcement_status` field via `ip-registry` update.
- **`scribe` (Legal & Compliance)** — contract clauses assigning IP or licensing our marks in / out route through `scribe` for template + review; the registry records the assignment/license under the appropriate row.
- **`comply` (Legal & Compliance)** — obligations arising from IP filings (annual reports, use requirements, working requirements in some jurisdictions) are recorded in `comply`'s `obligation-register` and cross-linked here.
- **`Cybersecurity/warden`** — trade-secret markers link to warden's controls (access, DLP, exit-interview process) — the registry records the fact of the trade secret, warden owns the control.
- **`Governance/board`** — L3 escalations per `guard-config.md`: any overdue renewal, any assertion decision above stakes threshold, any structural pattern of rights-erosion.
- **Shared OS: `verification-before-completion`** — inherited before any `registry.yaml` commit.

## Tool declaration (technical, not permission)

Per playbook §7 (`operational/tool/`), this list declares *technical needs*, not permission grants.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| ip-registry | File read/write | Web fetch (verify source URLs still resolve) · Domain registrar MCP (for domain expiry auto-check) · USPTO status check (via web fetch or MCP) | Steps 1–5 mutate `registry.yaml`; Steps 6–7 read it. Optional tools enable auto-verify of expiry dates instead of operator-provided. |
