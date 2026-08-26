---
agent: scribe
department: Legal & Compliance
type: config
purpose: >
  Playbook, escalation, and house style. Read by contract-review-routing to
  bind YVON's config layer to the vendor-agreement-review marketplace skill
  per playbook §7 and §4.8. Field list derived from actual skill references —
  every field in this file traces to a line in one of scribe's SKILL.md files.
required_by:
  - custom/contract-review-routing/SKILL.md   # Step 2 checks for these sections by name
  - marketplace/vendor-agreement-review/SKILL.md   # via the wrapper
config_debt_announcement: >
  Every <FILL_IN> in this file is a config debt announced on every skill
  invocation (playbook §14.7). Fill the value or mark it `n/a` with a one-line
  reason. Do not ship this agent with silent placeholders.
last_updated: 2026-07-29
---

# scribe · config

> **HOW TO USE.** Fill in each `<FILL_IN>` with a real value or replace it with `n/a — <one-line reason>`. Every unfilled field is announced on every skill invocation per playbook §14.7. Section headings are contract with `contract-review-routing` — do not rename them.

---

## Who's using this

| Field | Value |
|---|---|
| Role of the operator | `<FILL_IN — one of: lawyer / paralegal / non-lawyer>` |
| Contact for legal escalations | `<FILL_IN — name or role>` |

Non-lawyer role triggers additional bounce gates in `vendor-agreement-review` (Steps 5 and Integration/DocuSign) before redlines leave or a signature envelope is generated.

---

## Playbook · Sales-side

Positions used when the counterparty is a customer buying from this organisation. The eight categories match the SMB 8-category schema used by `contract-library` for template classification.

### 1. Payment & cash flow
- Standard position: `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker in this category: `<FILL_IN — yes/no; if yes, describe>`

### 2. Liability & indemnification
- Standard position (direct cap): `<FILL_IN — e.g., "12 months fees paid">`
- Standard position (indirect / consequential): `<FILL_IN — e.g., "excluded">`
- Standard position (cap-carveouts): `<FILL_IN — e.g., "data breach, IP, confidentiality">`
- Standard position (cap base): `<FILL_IN — exact wording, per marketplace skill Step 3.3>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 3. Termination & exit
- Standard position: `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 4. Intellectual property
- Standard position: `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 5. Scope & change management
- Standard position: `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 6. Non-compete & exclusivity
- Standard position: `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 7. Confidentiality & data
- Standard position (scope): `<FILL_IN>`
- Standard position (duration): `<FILL_IN — e.g., "3 years">`
- Standard position (DPA reference): `<FILL_IN — required / optional / n/a>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 8. Operational
- Standard position (auto-renewal): `<FILL_IN>`
- Standard position (assignment): `<FILL_IN>`
- Standard position (MFN): `<FILL_IN>`
- Standard position (audit rights): `<FILL_IN>`
- Standard position (dispute resolution): `<FILL_IN — e.g., "AAA arbitration, seat = <city>">`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

---

## Playbook · Purchasing-side

Positions used when the counterparty is a vendor supplying this organisation. Same eight categories as above.

### 1. Payment & cash flow
- Standard position: `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 2. Liability & indemnification
- Standard position (direct cap): `<FILL_IN>`
- Standard position (indirect / consequential): `<FILL_IN>`
- Standard position (cap-carveouts): `<FILL_IN>`
- Standard position (cap base): `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 3. Termination & exit
- Standard position: `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 4. Intellectual property
- Standard position: `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 5. Scope & change management
- Standard position: `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 6. Non-compete & exclusivity
- Standard position: `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 7. Confidentiality & data
- Standard position (scope): `<FILL_IN>`
- Standard position (duration): `<FILL_IN>`
- Standard position (DPA required): `<FILL_IN — yes/no; if yes, house DPA template slug from contract-library>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

### 8. Operational
- Standard position (auto-renewal): `<FILL_IN>`
- Standard position (assignment): `<FILL_IN>`
- Standard position (MFN): `<FILL_IN>`
- Standard position (audit rights): `<FILL_IN>`
- Standard position (dispute resolution): `<FILL_IN>`
- Acceptable fallback: `<FILL_IN>`
- Never accept: `<FILL_IN>`
- Deal-breaker: `<FILL_IN>`

---

## Escalation matrix

Contract value + issue severity → approver. Thresholds and approver names must be real; the marketplace skill's Step 5 quality-gate rejects `"escalate to legal"` as a name.

| Level | Threshold | Approver | Notes |
|---|---|---|---|
| L1 | contract value ≤ `<FILL_IN $X>` AND no 🔴 issues | `<FILL_IN — role or named person>` | Standard; scribe handles routing without external sign-off |
| L2 | `<FILL_IN $X>` < contract value ≤ `<FILL_IN $Y>` OR ≥1 🟠 issue | `<FILL_IN — role or named person>` | Business-unit or GC review |
| L3 | contract value > `<FILL_IN $Y>` OR ≥1 🔴 issue OR IP assignment OR unlimited liability | `Governance/board` | Fixed — constitutional threshold per department boundary ruling |

Automatic-escalation triggers (any → L3 regardless of value):

- Unlimited liability accepted anywhere in the memo.
- IP assignment (broad or ambiguous scope).
- Deal-breaker present per the list below.
- Contract requires waiver of scribe's default confidentiality position (Section 7 above).

---

## Deal-breaker list

Terms that halt detailed review and require operator/board decision before proceeding.

- `<FILL_IN — deal-breaker #1, or write "None declared — no term will halt review">`
- `<FILL_IN — deal-breaker #2 if any>`
- `<FILL_IN — deal-breaker #3 if any>`

**The one to check first** (per marketplace skill Step 2): `<FILL_IN — pick one deal-breaker from the list above; this is the single check that runs before any term-by-term comparison>`

---

## Governing law

| Field | Value |
|---|---|
| Preferred governing law | `<FILL_IN — jurisdiction and body of law, e.g., "England & Wales">` |
| Preferred venue | `<FILL_IN — court or arbitration seat>` |
| Choice-of-law fallback | `<FILL_IN — jurisdictions we will accept without escalation>` |
| Choice-of-law never-accept | `<FILL_IN>` |

The marketplace skill's Step 3 jurisdiction delta check compares the contract's governing law against the top divergences (non-solicits, auto-renewal, liability exclusions, indemnification, confidentiality term). Delta findings are `[jurisdiction — verify]` flags in the memo.

---

## House style

| Field | Value |
|---|---|
| Work-product header (default) | `<FILL_IN — the exact text to prepend to every memo; e.g., "PRIVILEGED AND CONFIDENTIAL — ATTORNEY WORK PRODUCT">` |
| Privilege circle (default distribution) | `<FILL_IN — comma-separated roles or names>` |
| Preferred date format | `<FILL_IN — e.g., "YYYY-MM-DD">` |
| Preferred citation style | `<FILL_IN — e.g., "Bluebook", "OSCOLA", or "n/a">` |
| Memo format default | `<FILL_IN — full-memo / slack-summary / both>` |
| Redline output default | `<FILL_IN — .docx tracked-changes / markdown / both>` |

Distribution rule (fixed, not `<FILL_IN>`): destination checks per marketplace skill's opening "Destination check" apply. Public channels, company-wide lists, counterparty, vendors, and clients (for work product) waive privilege; the memo header is stripped before external delivery.

---

## Matter workspaces

| Field | Value |
|---|---|
| Enabled | `<FILL_IN — ✓ / ✗ (default ✗ for in-house)>` |
| Matters root path (if enabled) | `<FILL_IN>` |
| Cross-matter context (if enabled) | `<FILL_IN — on / off (default off)>` |

---

## Config debt summary

| Section | Fields | Status |
|---|---|---|
| Who's using this | 2 | `<FILL_IN counter — auto-populated when someone runs skillgen>` |
| Playbook · Sales-side | 8 categories × ~4 fields | `<FILL_IN counter>` |
| Playbook · Purchasing-side | 8 categories × ~4 fields | `<FILL_IN counter>` |
| Escalation matrix | 4 thresholds + 3 approvers | `<FILL_IN counter>` |
| Deal-breaker list | ≥1 entry required | `<FILL_IN counter>` |
| Governing law | 4 | `<FILL_IN counter>` |
| House style | 6 | `<FILL_IN counter>` |
| Matter workspaces | 3 | `<FILL_IN counter>` |

Any `<FILL_IN>` remaining above is a debt announced on every invocation per playbook §14.7. Preferred steady state: 0, or explicit `n/a` on any field the operator has decided is not applicable.
