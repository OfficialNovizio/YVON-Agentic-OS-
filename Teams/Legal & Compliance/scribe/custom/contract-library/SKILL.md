---
name: contract-library
type: custom
status: built from scratch
assigned_agent: scribe (Legal & Compliance / Contracts)
portable: true
date_added: 2026-07-29
tier: 3
description: "Owns scribe's contract-template library — register, classify, version, publish, retire. Feeds contract-review-routing with the standard to compare against. Classification uses the SMB 8-category risk taxonomy."
triggers:
  - register this template
  - add this template
  - publish a new template
  - version bump this template
  - retire this template
  - what templates do we have
  - show me the contract library
  - find the msa template
  - find the nda template
  - list templates
---

# Contract Library

## Introduction

Built from scratch on 2026-07-29 as scribe's contract-template registry — a librarian, not a reviewer. Sits alongside `contract-review-routing`: the routing skill compares an incoming contract *against* the library; this skill owns *what's in* the library.

The template classification schema is the SMB 8-category risk taxonomy from `anthropics/knowledge-work-plugins/small-business/skills/contract-review`. That skill was not adopted as a marketplace skill (it bakes market defaults into its body, playbook §0.5) but its taxonomy is a useful classification frame; it is cited as a source per §4.6 rather than merged.

## Purpose

Own the state around scribe's contract templates:

- Which templates exist (template file + short slug).
- What each template is at right now (version, effective date).
- Which side it's meant for (sales / purchasing / mutual).
- Which jurisdiction it's calibrated for.
- Which clauses map to which of the 8 risk categories.
- What can be edited by whom without triggering escalation (F / G / E marks per clause).
- Publication protocol for adding a new template.
- Retirement protocol for deprecating one.

Physical templates live at `scribe/custom/contract-library/templates/`. Library state lives at `scribe/custom/contract-library/index.md`.

## When to Use

- Operator says "register this template", "add this template", "publish a new template", "version bump this template", "retire this template".
- Operator asks "what templates do we have", "show me the contract library", "find the MSA template", "list templates".
- Any request that would insert, update, or remove a row in the template index.

Do NOT use for:

- *Reviewing* an incoming contract — that's `contract-review-routing`.
- *Extracting* obligations from a signed contract — that's `obligation-extraction`.
- *Drafting* a new template from scratch. Templates must be operator-supplied per playbook §0.5 (no invented drafting).

## Structure / Protocol

```
REGISTER      operator supplies .docx + fields → validate → classify → index (draft)
CLASSIFY      map each clause to SMB 8-category taxonomy
BOUND         mark each clause F / G / E (edit boundary)
VERSION       operator supplies new revision + reason → bump version → archive old row
PUBLISH       mark row active; retire prior active row for same slug+side+jurisdiction
RETIRE        mark row retired; keep row + file for audit
RETRIEVE      lookup by slug or (type, side, jurisdiction) → return path + metadata
```

## Instructions

### Step 1: Register a new template

1. Operator supplies a `.docx` file plus these fields (never invent — ask if missing):
   - **slug** — short kebab-case identifier (e.g., `mutual-nda`, `saas-msa-purchasing-us`)
   - **type** — MSA / SaaS / NDA / SOW / Order Form / DPA / Reseller / Other
   - **side** — sales / purchasing / mutual
   - **jurisdiction** — governing law (e.g., US-CA, UK, EU/DE)
   - **owner** — who signed off on this template (name or role)
2. Copy the .docx into `templates/<slug>-v1.docx`. Do not rename or restructure the operator's file.
3. Run Step 2 (classify) and Step 3 (bound) before writing the row.
4. Add a row to `index.md` with the fields plus `version=1`, `effective_date=today`, `status=draft`.
5. Any missing required field halts registration and prompts the operator.

### Step 2: Classify (SMB 8-category schema)

Each template's clauses map to at least one of these categories. Multiple mappings per clause are allowed.

| # | Category | Typical clauses |
|---|---|---|
| 1 | Payment & cash flow | Payment terms, invoice cadence, late-payment penalties, rate adjustments |
| 2 | Liability & indemnification | Liability cap, indemnity scope, insurance requirements, consequential damages waiver |
| 3 | Termination & exit | Termination for convenience / for cause, cure period, wind-down, transition assistance, survival |
| 4 | Intellectual property | IP assignment vs. license, background IP carveout, work-product definition |
| 5 | Scope & change management | Scope definition, change-order process, acceptance criteria, timeline symmetry |
| 6 | Non-compete & exclusivity | Non-compete scope, exclusivity, non-solicitation |
| 7 | Confidentiality & data | Confidentiality scope + duration, data-handling requirements, return/destruction, DPA reference |
| 8 | Operational | Governing law, dispute resolution, auto-renewal, assignment, MFN, audit rights |

Source: `anthropics/knowledge-work-plugins/small-business/skills/contract-review` (cited per playbook §4.6; not merged).

### Step 3: Define edit boundaries (F / G / E)

For each clause classified in Step 2, mark whether it can be edited during a review without triggering escalation:

- **F** — Free edit (formatting, references, dates, names).
- **G** — Guardrailed (edit within a stated range; e.g., payment terms 15–45 days). The range is recorded in the row's `bounds` field.
- **E** — Escalation required (any change routes to the approver named in `scribe-config.md` for this side+jurisdiction).

These marks are what `contract-review-routing` reads to decide whether a proposed redline needs escalation.

### Step 4: Version bump

1. Operator supplies a new `.docx` and a **reason** (bug fix, market shift, new statute, negotiation lesson).
2. Copy the new file to `templates/<slug>-v<N+1>.docx`.
3. Re-run Steps 2 and 3 against the new file — the classification and boundaries do not carry over automatically.
4. Add a new row to `index.md` with `version=N+1`, `effective_date=today`, `status=draft`.
5. Mark the previous row's `superseded_by=v<N+1>` and `status=archived`. Do not delete the old row.

### Step 5: Publish

Only the operator can publish. On operator instruction:

1. Set `status=active` on the current draft row.
2. Verify no other row for the same slug+side+jurisdiction is active. If one is, retire it (Step 6) before publishing.
3. Append the publication event to `index.md`'s changelog section (date · slug · version · operator).

### Step 6: Retire

1. Set `status=retired` on the row.
2. Keep the row and the .docx file. Retirement is not deletion — audit history matters.
3. If `contract-review-routing` requests this template afterwards, return `retired since <date>; use <replacement slug> at v<N>` if a replacement exists, or `retired without replacement` if it does not.

### Step 7: Retrieve

On lookup request (from `contract-review-routing` or the operator):

- Match on slug (exact) or on (type, side, jurisdiction) tuple.
- Return the active version's path + full metadata block.
- If no active template matches, return `not found` — do not substitute a similar template silently.

## Output Format

- **Register / version / publish / retire** → confirmation line + the resulting `index.md` row shown to the operator.
- **Retrieve** → template path, version, effective_date, side, jurisdiction, classification map, edit-boundary marks. In that order.
- **List / show library** → `index.md` rendered as a table, active rows first, archived and retired at the bottom.

## Principles

- **No invented drafting.** Templates come from the operator, always. This skill is a librarian, not a drafter (playbook §0.5).
- **Never delete history.** Superseded and retired rows stay in the index. The audit trail is the point.
- **One active version per slug+side+jurisdiction.** Publishing enforces this; the previous active row must be retired first.
- **Classification is required.** A template with no category map cannot reach `status=active`. If the operator can't classify it, the template isn't ready.
- **Edit boundaries drive escalation.** F/G/E marks are how `contract-review-routing` decides what needs approval. Skipping them collapses the escalation logic (playbook §0.5 — no invented thresholds).

## Fallback

| Failure mode | Response |
|---|---|
| Required registration field missing | Ask the operator; do not defer or invent |
| .docx unreadable | Surface the error verbatim; do not proceed |
| Classification uncertain | Present the closest 1–3 categories and ask the operator to confirm; do not assign silently |
| Retrieve has no active match | Return `not found`; do not substitute |
| Publish attempted while another version is active | Halt; require retirement first |
| Retirement attempted on the only active version for a slug | Warn — retiring leaves no active template; require explicit `retire without replacement` from operator |

## Boundaries with Other Skills

- **`contract-review-routing` (custom, this agent)** — this skill supplies the standard; the routing skill compares against it. One-way: library → routing.
- **`vendor-agreement-review` (marketplace, this agent)** — no direct handoff. The marketplace skill only ever sees a resolved playbook; it never touches the library directly.
- **`obligation-extraction` (custom, this agent)** — no direct handoff, but consumes the same slug identifiers so obligations can be tracked back to their template.
- **`Governance/precedent`** — if a proposed edit falls outside a template's edit boundaries and a prior ruling exists on similar edits, `precedent` is consulted before the change is applied.
- **`Cybersecurity/warden`** — if a template requires a security-control commitment (SOC 2 evidence, breach-notification SLA), the control-design question is `warden`'s; the template records only the commitment.
- **Shared OS: `docx` skill** — required dependency. Reading and writing `.docx` templates goes through the docx skill; this skill does not parse Word files directly.

## Tool declaration (technical, not permission)

Per playbook §7 (`operational/tool/`), this list declares *technical needs*, not permission grants. Actual tool access is configured at runtime by whoever deploys scribe.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| contract-library | File read/write · docx skill | — | This SKILL.md — Instructions Steps 1, 4, 5, 6, 7 mutate `index.md` and files in `templates/`; Step 2 reads .docx clauses via docx skill |
