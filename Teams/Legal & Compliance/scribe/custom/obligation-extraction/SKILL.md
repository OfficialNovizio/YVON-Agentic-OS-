---
name: obligation-extraction
type: custom
status: built from scratch
assigned_agent: scribe (Legal & Compliance / Contracts)
portable: true
date_added: 2026-07-29
tier: 4
description: "After a contract is signed, extract ongoing obligations (renewals, notice windows, insurance, audits, data return, MFN, reporting, non-solicit, non-compete, price adjustment) into a machine-readable ledger keyed by counterparty+slug. Currently LLM-based reasoning against a 10-type taxonomy — reasoning-based per §0.6 until touch-2 produces the book-grounded script at Shared OS/logical/contract_obligation_taxonomy.py."
triggers:
  - extract obligations from this contract
  - add this signed contract to the ledger
  - track this contract
  - what am i on the hook for
  - what obligations are we tracking
  - show me the obligation ledger
  - what renewals are coming up
  - notice window on this vendor
  - upcoming contract obligations
---

# Obligation Extraction

## Introduction

Built from scratch on 2026-07-29 as scribe's post-signing obligation tracker. Sits after the review flow — `contract-review-routing` catches risk *before* signing, `contract-library` owns the pre-signing standard, and this skill catches drift *after* signing.

Not in the source catalog. Added because missing an auto-renewal notice window, a required insurance renewal, or a data-return deadline is a common expensive failure mode that a review skill cannot prevent, but an ongoing ledger can.

**Current state — reasoning-based, not book-grounded (playbook §0.6).** Extraction is LLM-based: the agent reads the contract, identifies candidate obligations against a fixed 10-type taxonomy, tags every candidate `confidence: low`, and the operator confirms or rejects each before ledger commit. This is Route B/C in principle per playbook §8.2, but there is currently **no logical script** to enforce the taxonomy deterministically.

Touch-2 will replace the LLM step with `Shared OS/logical/contract_obligation_taxonomy.py` — a Route B rule engine grounded in Adams & Cramer *A Practical Guide to Drafting Contracts* (CALI eLangdell) + UNIDROIT Principles of International Commercial Contracts 2016. Until that script exists, this skill flags its extraction output as reasoning-based (not formula-verified) per playbook §0.6.

**A prior invented script (`scripts/extract_obligations.py`) was removed 2026-07-29** because it was authored from general knowledge, not extracted from a source book — a §0.5 and §8 violation. The taxonomy names are retained; the pattern-matching logic is not.

## Purpose

For each signed contract in scope, maintain a machine-readable record of the ongoing obligations that arise from it:

- **renewal** — auto-renewal cadence and term
- **notice-window** — notice periods (opt-out, termination, price change)
- **insurance** — types + limits + renewal dates
- **audit** — rights, cadence, notice
- **data-return** — deletion deadlines on termination
- **mfn** — most-favored-nation commitments
- **non-solicit** — restrictive covenants on hiring
- **non-compete** — restrictive covenants on competition
- **reporting** — recurring reports owed to counterparty
- **price-adjustment** — CPI, indexation, escalation caps

Ledger lives at `ledger.yaml`. Keyed by `counterparty + slug + effective_date` so multiple contracts with the same counterparty stay distinct.

## When to Use

- Operator says "extract obligations from this contract", "add this signed contract to the ledger", "track this contract".
- Operator asks "what am I on the hook for", "what obligations are we tracking", "what renewals are coming up", "what's the notice window on this vendor".
- Any request that reads or mutates `ledger.yaml`.

Do NOT use for:

- *Reviewing* an unsigned contract — that's `contract-review-routing`.
- *Managing templates* — that's `contract-library`.
- *Alerting* on upcoming deadlines — this skill maintains the ledger; time-based alerting is out of scope (a future scheduler concern).

## Structure / Protocol

```
INTAKE       operator supplies signed .docx (or plain text) + counterparty + slug + effective_date
PARSE        run scripts/extract_obligations.py → low-confidence candidates in YAML
REVIEW       present each candidate to operator; operator confirms / rejects / edits
COMMIT       append confirmed obligations to ledger.yaml under the contract's key
RETRIEVE     lookup by counterparty / slug / obligation type / upcoming date
```

## Instructions

### Step 1: Intake

Operator supplies:

- Signed contract as `.docx` (via docx skill) or plain text.
- **counterparty** — exact name (as in the contract).
- **slug** — the template slug from `contract-library` this contract instantiates (or `custom` if none).
- **effective_date** — YYYY-MM-DD from the contract.

If any is missing, ask. Do not invent (playbook §0.5).

### Step 2: Parse (currently LLM-based — pending touch-2 script)

Read the contract end-to-end. For each of the 10 obligation types (see Purpose), identify every candidate clause that plausibly matches. For each candidate, record:

- `type` — one of the 10 taxonomy entries
- `matched` — the exact phrase from the contract that triggered the match
- `context` — ~200 characters of surrounding text
- `source_section` — the section number or heading
- `confidence: low` — always low at this stage; every candidate needs Step 3 operator confirmation

False positives are expected and cheap. False negatives (missed obligations) are expensive. Bias toward inclusion.

**Reasoning-based flag (§0.6).** This step is currently LLM-based, not book-grounded. Every candidate list emitted at Step 2 carries the tag `[REASONING-BASED — pending Shared OS/logical/contract_obligation_taxonomy.py from touch-2]`. When touch-2 produces the deterministic Route B script, Step 2 switches to `python3 <script_path> <contract> <counterparty> <slug> <effective_date>` and this flag is removed.

### Step 3: Review

Present each candidate to the operator in a compact table (per playbook §0.9):

| # | type | matched | context (excerpt) | proposed date | keep? |
|---|---|---|---|---|---|

For each row the operator marks keep / drop / edit. Never commit without this pass — the ledger is the source of truth downstream.

### Step 4: Commit

Append to `ledger.yaml` under the contract's key:

```yaml
- counterparty: <name>
  slug: <slug>
  effective_date: <YYYY-MM-DD>
  contract_path: <path to signed file>
  registered_at: <today>
  obligations:
    - id: <auto-slug e.g. renewal-auto>
      type: <one of the 10 types>
      description: <plain-english summary>
      trigger_date: <YYYY-MM-DD or null>
      notice_window_days: <int or null>
      source_section: <"§14.2" or the contract heading>
      confidence: confirmed
      operator: <name of operator who confirmed>
```

Do not overwrite prior entries for the same counterparty+slug — a new signing gets a new block. History is the audit trail.

### Step 5: Retrieve

- **By counterparty** → list all contracts + all confirmed obligations.
- **By type** → across all contracts, list all obligations of type X.
- **By upcoming date** → given a horizon window (default 90 days), list obligations with `trigger_date` in that window.
- **By slug** → list obligations that appear on contracts of a given template slug (useful for tracking whether a template creates unusual obligations at scale).

Return only what is asked; do not summarise the ledger in prose unless asked.

## Output Format

- **Parse output** (Step 2) → the script's YAML, unmodified.
- **Review** (Step 3) → table per §0.9.
- **Commit confirmation** (Step 4) → one-line confirmation + the appended block echoed to the operator.
- **Retrieve** (Step 5) → table format matching the query type.

## Principles

- **Every candidate is low-confidence until an operator confirms.** The script never writes to the ledger; the operator does, via the confirmation step.
- **No invented dates.** If the contract does not state a date, `trigger_date: null` — never infer a date from context.
- **Never overwrite history.** Each signing gets a distinct block. Amendments produce a new entry.
- **Type taxonomy is fixed.** The ten types listed above are the schema; new types require an explicit schema update (a build discussion, not a per-obligation guess).
- **Reasoning-based until touch-2.** The extraction is currently LLM-driven; every candidate list carries the `[REASONING-BASED]` flag. Touch-2 replaces the reasoning step with a book-grounded script at `Shared OS/logical/contract_obligation_taxonomy.py` and the flag is removed then, not before (playbook §8.4 Tier A on completion).
- **The extraction is a candidate generator, not a decision.** Whatever produces the candidates (LLM now, script after touch-2), the operator is the filter.

## Fallback

| Failure mode | Response |
|---|---|
| Required intake field missing | Ask the operator; do not defer |
| Contract file unreadable | Surface the error verbatim |
| Extraction returns zero candidates | Ask the operator whether the contract genuinely has none, or the extraction missed them; do not silently commit an empty block |
| Operator can't classify a candidate | Present the closest 1–3 types and ask; do not assign silently |
| Ledger file corrupted or malformed | Halt; do not attempt auto-repair |
| Retrieve matches nothing | Return `no matches` — do not substitute related results |

## Boundaries with Other Skills

- **`contract-review-routing` (custom, this agent)** — no direct handoff; this skill runs *after* signing, that one runs *before*.
- **`contract-library` (custom, this agent)** — consumes slug identifiers so obligations can be tracked back to their template. If many contracts of the same slug produce the same anomalous obligation, that is a signal to update the template (a `contract-library` version bump).
- **`vendor-agreement-review` (marketplace, this agent)** — no direct interaction.
- **`Governance/precedent`** — if an obligation type is unusual and no prior contract has one like it, `precedent` may want to weigh in on whether it becomes house-standard.
- **`Cybersecurity/warden`** — audit and reporting obligations that require ongoing control effectiveness (SOC 2 evidence, breach-notification cadence) route to `warden` for tracking on the control side; the ledger just records the commitment.
- **Shared OS: `docx` skill** — required dependency for `.docx` inputs (plain text inputs skip this).

## Tool declaration (technical, not permission)

Per playbook §7 (`operational/tool/`), this list declares *technical needs*, not permission grants. Actual tool access is configured at runtime by whoever deploys scribe.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| obligation-extraction | File read/write · docx skill | Python/shell execution (future — required once touch-2 produces `Shared OS/logical/contract_obligation_taxonomy.py`) | Steps 1 (docx input), 4 (ledger write). Step 2 is currently LLM-based; script dependency returns after touch-2. |
