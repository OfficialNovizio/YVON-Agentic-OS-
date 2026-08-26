---
agent: guard
department: Legal & Compliance
type: config
purpose: >
  Shared config for guard — IP practice profile, enforcement posture, integrations,
  decision posture, OSS policy, approval chain, work-product header. Read by
  ip-routing (Step 3) to bind all three marketplace skills to YVON's config layer;
  read by ip-registry for jurisdiction scope + escalation thresholds.
required_by:
  - custom/ip-routing/SKILL.md   # Step 3
  - custom/ip-registry/SKILL.md
  - marketplace/clearance/SKILL.md   # via wrapper
  - marketplace/oss-review/SKILL.md   # via wrapper
  - marketplace/infringement-triage/SKILL.md   # via wrapper
config_debt_announcement: >
  Every <FILL_IN> in this file is announced on every skill invocation
  (playbook §14.7). Fill or mark n/a with one-line reason.
last_updated: 2026-07-29
---

# guard · config

> **HOW TO USE.** Fill each `<FILL_IN>` with a real value or replace with `n/a — <one-line reason>`. Section headings are contract with `ip-routing` and `ip-registry` — do not rename.

---

## Who's using this

| Field | Value |
|---|---|
| Role of the operator | `<FILL_IN — lawyer / paralegal / non-lawyer>` |
| Contact for IP escalations | `<FILL_IN>` |

Non-lawyer role triggers additional gates in all three marketplace skills.

---

## IP practice profile

| Field | Value |
|---|---|
| Registered in (default TM jurisdictions) | `<FILL_IN — e.g., US, EU, UK, Madrid>` |
| Enforce where (litigation venues) | `<FILL_IN>` |
| Default patent office | `<FILL_IN — e.g., USPTO / EPO / CNIPA>` |
| Default TM office | `<FILL_IN — e.g., USPTO / EUIPO / UKIPO>` |

No hardcoded jurisdiction (playbook §0.4b). Add or remove per operator scope.

---

## Enforcement posture

| Level | Meaning |
|---|---|
| Aggressive | Assert broadly; auto-C&D on plausible infringement |
| Measured | Assert on material infringement; case-by-case |
| Conservative | Assert only on clear-and-material; heavy reliance on watch-only |

Current: `<FILL_IN — aggressive / measured / conservative>`

Posture per asset class (override the default above per asset type if the org treats them differently):

| Asset class | Posture |
|---|---|
| Trademarks | `<FILL_IN>` |
| Patents | `<FILL_IN>` |
| Copyrights | `<FILL_IN>` |
| Trade secrets | `<FILL_IN>` |

---

## Available integrations

| Integration | Purpose | Configured? |
|---|---|---|
| Solve Intelligence MCP | TM database search across registries | `<FILL_IN — yes/no + endpoint if yes>` |
| Descrybe MCP | TM design/image search | `<FILL_IN>` |
| CourtListener MCP | Case law + TTAB decisions | `<FILL_IN>` |
| Domain registrar MCP | Domain expiry auto-check | `<FILL_IN>` |
| USPTO status API | Registration status check | `<FILL_IN>` |
| Ticketing MCP (Jira / Linear / Asana) | OSS clearance requests | `<FILL_IN>` |

---

## Decision posture on subjective legal calls

| Judgment | Guard's posture |
|---|---|
| "Not confusingly similar" (TM clearance) | **Never conclude.** Always flag for attorney (built into `clearance` skill body) |
| "Fair use" (copyright) | **Never conclude.** Always flag for attorney (built into `infringement-triage` copyright mode) |
| "Not infringing" (any right) | **Never conclude.** Always flag for attorney (built into `infringement-triage`) |
| "OSS license is permissive" when the classification is uncertain | **Never default to permissive.** License-unknown = needs review (built into `oss-review`) |

These are hardcoded into the marketplace skills; this config table names them for the operator's reference.

---

## OSS policy

Uploaded / declared OSS policy. If uploaded, `oss-review` treats this as the source of truth for accepted / review-required / banned licenses.

| Field | Value |
|---|---|
| OSS policy document | `<FILL_IN — path to uploaded policy, or "none — apply generic classifier">` |
| Accepted licenses (auto-approve) | `<FILL_IN — e.g., MIT, BSD-2, BSD-3, Apache-2.0, ISC>` |
| Review-required licenses | `<FILL_IN — e.g., LGPL, MPL, EPL, CDDL>` |
| Banned licenses | `<FILL_IN — e.g., AGPL for SaaS deployment, GPL for distributed binary>` |
| Non-OSI stance | `<FILL_IN — e.g., "SSPL/BUSL banned; requires commercial license from vendor">` |

---

## Approval chain (per letter type)

`infringement-triage` and downstream `cease-desist` / `takedown` skills route per this chain.

| Letter type | L1 approver | L2 approver | L3 approver | Notes |
|---|---|---|---|---|
| C&D — trademark | `<FILL_IN — guard itself or role>` | `<FILL_IN — GC or role>` | `Governance/board` | L3 is fixed |
| C&D — copyright | `<FILL_IN>` | `<FILL_IN>` | `Governance/board` | L3 is fixed |
| Patent assertion letter | `<FILL_IN>` | `<FILL_IN>` | `Governance/board` | L3 is fixed |
| DMCA takedown | `<FILL_IN>` | `<FILL_IN>` | `Governance/board` | Rarely reaches L3 |
| Trade secret demand | `<FILL_IN>` | `<FILL_IN>` | `Governance/board` | L3 is fixed |

---

## Escalation matrix (for ip-registry + non-letter events)

| Level | Threshold | Approver | Notes |
|---|---|---|---|
| L1 | Routine attestation · retrieval | guard itself | No external sign-off |
| L2 | New IP registered · renewal executed · scope change | `<FILL_IN>` | Business-unit or GC |
| L3 | Any overdue renewal · scale attestation shortfall > 20% · assertion decision above stakes threshold | `Governance/board` | Fixed |

---

## Renewal alert thresholds

| Alert tier | Days-to-expiry |
|---|---|
| 🔴 Overdue | past 0 |
| 🟠 Critical | ≤ 30 |
| 🟡 Warning | ≤ 60 |
| 🟢 Informational | ≤ 90 |

Cadence for the registry-review scheduled task: `<FILL_IN — weekly / monthly>`.

---

## Work-product header

| Role | Header text |
|---|---|
| Lawyer | `<FILL_IN — e.g., "PRIVILEGED AND CONFIDENTIAL — ATTORNEY WORK PRODUCT">` |
| Paralegal | `<FILL_IN>` |
| Non-lawyer | `<FILL_IN — probably no privilege header; instead "INTERNAL — NOT LEGAL ADVICE">` |

---

## House style

| Field | Value |
|---|---|
| Privilege circle (default distribution) | `<FILL_IN>` |
| Preferred date format | `<FILL_IN — e.g., YYYY-MM-DD>` |
| Preferred citation style | `<FILL_IN — e.g., Bluebook>` |
| Memo default format | `<FILL_IN — full-memo / slack-summary / both>` |

---

## Config debt summary

| Section | Fields | Status |
|---|---|---|
| Who's using this | 2 | `<FILL_IN counter>` |
| IP practice profile | 4 | `<FILL_IN counter>` |
| Enforcement posture | 1 + 4 per-class | `<FILL_IN counter>` |
| Available integrations | 6 | `<FILL_IN counter>` |
| OSS policy | 5 | `<FILL_IN counter>` |
| Approval chain | 5 letter types × 2 approver names | `<FILL_IN counter>` |
| Escalation matrix | 1 approver name | `<FILL_IN counter>` |
| Renewal alert cadence | 1 | `<FILL_IN counter>` |
| Work-product header | 3 | `<FILL_IN counter>` |
| House style | 4 | `<FILL_IN counter>` |
