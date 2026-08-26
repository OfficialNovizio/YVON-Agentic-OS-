---
agent: comply
department: Legal & Compliance
type: config
purpose: >
  Watchlist, materiality tiers, feed configuration, jurisdictions, regimes catalog,
  escalation matrix, review cadence, and house style. Read by reg-monitor-routing
  to bind YVON's config layer to the reg-feed-watcher marketplace skill. Read by
  obligation-register and regulated-activity-readiness for jurisdiction/regime scope.
  Field list derived from actual skill references — every field traces to a line in
  one of comply's SKILL.md files.
required_by:
  - custom/reg-monitor-routing/SKILL.md   # Step 2 checks these sections by name
  - custom/obligation-register/SKILL.md   # jurisdiction + escalation matrix
  - custom/regulated-activity-readiness/SKILL.md   # regimes catalog + escalation
  - marketplace/reg-feed-watcher/SKILL.md   # via the wrapper
config_debt_announcement: >
  Every <FILL_IN> in this file is a config debt announced on every skill
  invocation (playbook §14.7). Fill the value or mark it `n/a` with a one-line
  reason.
last_updated: 2026-07-29
---

# comply · config

> **HOW TO USE.** Fill each `<FILL_IN>` with a real value or replace with `n/a — <one-line reason>`. Section headings are contract with `reg-monitor-routing`, `obligation-register`, and `regulated-activity-readiness` — do not rename.

---

## Who's using this

| Field | Value |
|---|---|
| Role of the operator | `<FILL_IN — lawyer / paralegal / compliance officer / non-lawyer>` |
| Contact for compliance escalations | `<FILL_IN — name or role>` |
| DPO / Privacy officer (if applicable) | `<FILL_IN>` |

---

## Jurisdictions in scope

| Jurisdiction code | Notes |
|---|---|
| `<FILL_IN — e.g., US-federal>` | `<FILL_IN>` |
| `<FILL_IN — e.g., US-CA>` | `<FILL_IN>` |
| `<FILL_IN — e.g., EU>` | `<FILL_IN>` |

No hardcoded jurisdiction (playbook §0.4b). Add or remove rows freely.

---

## Watchlist

Regulators to monitor via `reg-feed-watcher`. At least one required for feed checks to run.

| Regulator | Source type | Slug / URL | Notes |
|---|---|---|---|
| `<FILL_IN — e.g., FTC>` | `federal-register-slug` | `federal-trade-commission` | `<FILL_IN>` |
| `<FILL_IN>` | `rss` | `<FILL_IN URL>` | `<FILL_IN>` |
| `<FILL_IN>` | `paid-mcp` | `<FILL_IN identifier>` | `<FILL_IN — only if MCP configured>` |

---

## Materiality tiers

Definitions used by `reg-feed-watcher` Step 2 to classify feed items.

| Tier | Definition |
|---|---|
| 🔴 Always material | `<FILL_IN — e.g., "final rule from watchlist regulator that touches our sectors">` |
| 🟡 Review-worthy | `<FILL_IN>` |
| 📝 FYI | `<FILL_IN>` |
| skip | `<FILL_IN — what gets filtered out>` |

---

## Feed configuration

Aggregate of Tier 1 (free), Tier 2 (paid MCP), and Tier 3 (manual) sources.

| Tier | Enabled | Notes |
|---|---|---|
| Tier 1 — Federal Register API + direct RSS | ✅ default | Free; requires web fetch permission |
| Tier 2 — Paid regulatory feed MCP | `<FILL_IN — yes/no; if yes, MCP name>` | Requires MCP connected |
| Tier 2 — CourtListener MCP | `<FILL_IN — yes/no>` | Requires MCP connected |
| Tier 3 — Manual entry | ✅ always available | No config needed |

Digest output path: `<FILL_IN — e.g., "~/regulatory-legal-digests/reg-digest-YYYY-MM-DD.md" or "chat only">`.

---

## Comment tracker

| Field | Value |
|---|---|
| Enabled | `<FILL_IN — yes/no>` |
| Default owner for comment decisions | `<FILL_IN — role or name>` |
| Comment tracker file path | `<FILL_IN — default: ~/.claude/plugins/config/…/comment-tracker.yaml>` |

---

## Regimes catalog

For each (category × jurisdiction) tuple, which regime applies. Used by `regulated-activity-readiness` Step 3.

| Category | Jurisdiction | Regime | Compliance path (default) |
|---|---|---|---|
| `<FILL_IN — e.g., money-services>` | `<FILL_IN — e.g., US-federal>` | `<FILL_IN — e.g., BSA/AML + FinCEN MSB>` | `<FILL_IN>` |
| `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |

Add rows as the operator declares new jurisdictions or categories. Never invent regimes (playbook §0.5).

---

## Always-L3 categories

Categories that auto-escalate to `Governance/board` on any BLOCKED or UNKNOWN verdict from `regulated-activity-readiness`, regardless of launch date:

- money-services / payments / money-transmitter
- deposit-taking / banking
- investment / broker-dealer / securities
- health-data / PHI
- credit-reporting

`<FILL_IN — add or remove categories per your risk posture>`

---

## Escalation matrix

Feed check + register + readiness all share this ladder. Approver names must be real; L3 is fixed to `Governance/board`.

| Level | Threshold | Approver | Notes |
|---|---|---|---|
| L1 | Feed item = FYI · Register update = routine attestation · Readiness = CLEAR | comply itself | No external sign-off |
| L2 | Feed item = review-worthy · Register update = new obligation or scope change · Readiness = CONDITIONAL | `<FILL_IN — role or named person>` | Business-unit / GC review |
| L3 | Feed item = always-material · Register attestation > 20% overdue · Readiness = BLOCKED · any always-L3 category | `Governance/board` | Fixed — constitutional threshold |

---

## Review cadence

| Field | Value |
|---|---|
| Obligation register review cadence | `<FILL_IN — quarterly by default; can be monthly or annual>` |
| Regulator-feed check cadence | `<FILL_IN — daily / weekly / on-demand>` |
| Regime catalog re-verification | `<FILL_IN — annual>` |

---

## House style

| Field | Value |
|---|---|
| Work-product header (default) | `<FILL_IN — e.g., "PRIVILEGED AND CONFIDENTIAL — ATTORNEY WORK PRODUCT">` |
| Privilege circle (default distribution) | `<FILL_IN>` |
| Preferred date format | `<FILL_IN — e.g., "YYYY-MM-DD">` |
| Preferred citation style | `<FILL_IN — e.g., "Bluebook", "OSCOLA", or "n/a">` |
| Digest format default | `<FILL_IN — full-memo / slack-summary / both>` |

---

## Config debt summary

| Section | Fields | Status |
|---|---|---|
| Who's using this | 3 | `<FILL_IN counter>` |
| Jurisdictions in scope | ≥1 required | `<FILL_IN counter>` |
| Watchlist | ≥1 required | `<FILL_IN counter>` |
| Materiality tiers | 4 | `<FILL_IN counter>` |
| Feed configuration | 4 rows + digest path | `<FILL_IN counter>` |
| Comment tracker | 3 | `<FILL_IN counter>` |
| Regimes catalog | ≥1 row required per active jurisdiction | `<FILL_IN counter>` |
| Always-L3 categories | 5 default + additions | `<FILL_IN counter>` |
| Escalation matrix | 2 approver names (L1 fixed, L3 fixed) | `<FILL_IN counter>` |
| Review cadence | 3 | `<FILL_IN counter>` |
| House style | 5 | `<FILL_IN counter>` |

Any `<FILL_IN>` remaining is announced on every invocation per playbook §14.7.
