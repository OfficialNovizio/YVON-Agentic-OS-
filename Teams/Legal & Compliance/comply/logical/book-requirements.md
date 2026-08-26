---
agent: comply
department: Legal & Compliance
type: logical-book-requirements
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# comply · logical / book-requirements

> **Touch 1 placeholder** (playbook §8.1). Books identified via the §8.12 end-of-agent step; §8.8a 3-attempt hunt complete during scribe's build and applied dept-wide here. No scripts extracted yet; every 0.6-flagged judgment below is reasoning-based (§0.6) until touch 2 runs.

---

## Proposed scripts for touch-2 (§8.0 minimum-two-books-per-script)

Path chosen 2026-07-29: **Path 1 — all-free build.** No paywalled books required to reach Tier A (§8.4).

| # | Proposed script | Route | Source book #1 (★) | Source book #2 | Notes |
|---|---|---|---|---|---|
| 1 | `regulatory_materiality_classifier` | B | UNIDROIT Principles of International Commercial Contracts (2016) — [Official PDF](https://www.unidroit.org/wp-content/uploads/2021/06/Unidroit-Principles-2016-English-bl.pdf) — **Note: UNIDROIT article registry available now at `Shared OS/logical/contract_doctrine_unidroit.py`** (extracted 2026-07-29; can be imported for doctrine-tag lookups when classifying regulatory items that reference contract obligations) | ABA Model Rules of Professional Conduct — [ABA free-access](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/) | Grounds `reg-feed-watcher` materiality tier definitions. Deterministic Route B rule-engine mapping item-type + sector-match → tier. |
| 2 | `regime_lookup_engine` | B | USPTO TMEP + WIPO IP Handbook (institutional, free) | UNIDROIT Principles + operator's declared regimes catalog | Grounds `regulated-activity-readiness` Step 3 regime lookup. Deterministic: given (category, jurisdiction), returns applicable regime + compliance path. Cross-references `obligation-register`. |
| 3 | `obligation_attestation_review` | C | ABA Model Rules of Professional Conduct | Brandeis, *Other People's Money* + selected dissents (public domain) | Grounds `obligation-register` Step 5 quarterly review. Hybrid Route C — deterministic aggregation of attestation status; Brandeis-derived disclosure heuristics for what to escalate at what threshold. |
| 4 | `brandeis-disclosure-heuristics` (Route D — `.md` per §8.9) | D | Brandeis, *Other People's Money* (1914) | Brandeis's Supreme Court dissents (*Olmstead*, *Whitney*) — public domain | Qualitative wisdom extract (§8.9). Grounds comply's identity persona operationally: what counts as disclosure vs concealment, when a pattern warrants structural remedy vs individual fix. |

**Tier assessment (§8.4):** all 4 proposed artefacts are Tier A candidates (real book supplied, whole-book access) → flag removable on touch-2.

**Source authentication (§8.8):**
- **Institutional:** UNIDROIT (intergovernmental), USPTO (US federal), WIPO (intergovernmental), ABA (professional academy).
- **Historical / public domain:** Brandeis's own writings (US Supreme Court + 1914 published work).

**Whole-book access (§8.10):** UNIDROIT is direct-PDF. USPTO TMEP and WIPO handbooks are direct-web. ABA Model Rules are free at ABA site. Brandeis's works are Project Gutenberg / Internet Archive public domain. No summary-site substitution permitted.

---

## Inherited scripts

None yet. `Shared OS/logical/` currently has no comply-specific scripts. If script #1 (`regulatory_materiality_classifier`) or #2 (`regime_lookup_engine`) is extracted, it lives at `Shared OS/logical/` and any other Legal & Compliance agent that needs regulatory-materiality classification (e.g., `shield` triaging enforcement actions) imports rather than duplicating (playbook §13.5).

---

## Skills → proposed script mapping

| Skill | Imports from `Shared OS/logical/` (touch-2) | Rationale |
|---|---|---|
| `reg-monitor-routing` | `regulatory_materiality_classifier` (#1) | Materiality tier assignment currently reasoning-based; grounded in touch-2 |
| `reg-feed-watcher` | `regulatory_materiality_classifier` (#1) | Same — marketplace skill inherits by wrapper |
| `obligation-register` | `obligation_attestation_review` (#3) · `brandeis-disclosure-heuristics.md` (#4) | Quarterly review classification (attested / due / overdue); disclosure heuristics for escalation |
| `regulated-activity-readiness` | `regime_lookup_engine` (#2) · `regulatory_materiality_classifier` (#1) | Regime lookup + category classification |

---

## Flag clearance (0.6 audit — playbook §8.5)

Current state: **all comply judgments below are reasoning-based** (0.6-flagged) pending touch-2.

| Judgment | Skill(s) | Current state | Cleared by (touch-2) |
|---|---|---|---|
| Materiality tier assignment for feed items | `reg-monitor-routing`, `reg-feed-watcher` | reasoning-based; operator-configured thresholds are partly Tier B (config values named by operator) | script #1 |
| Regime applicability for (category, jurisdiction) tuple | `regulated-activity-readiness` | reasoning-based; falls back to `UNKNOWN` when unmapped | script #2 |
| Escalation threshold for pattern of overdue attestations | `obligation-register` (Step 5) | reasoning-based (20% default is a Brandeis-style disclosure heuristic) | script #3 + `.md` #4 |
| Category classification for a proposed activity | `regulated-activity-readiness` (Step 2) | reasoning-based (fixed 12-category taxonomy is Route B, but classification of specific activities is judgment) | script #2 |
| "Always-L3" category list | `comply-config.md` + `regulated-activity-readiness` | operator-set config; is Tier B (canonical categories like money-service, securities are well-known regulatory categories) | remain Tier B — no book-source required |

---

## Corrections carried over from scribe

None specific to comply — but the fleet-wide lesson from scribe's build applies here (playbook §13.5 was refined 2026-07-29, and §0.5 forbids invented scripts). If touch-2 produces a script here that is Tier C (no source), it does not ship — it stays reasoning-based, explicitly.

---

## Inherited scripts (Shared OS/logical/)

| Script | Source | Purpose |
|---|---|---|
| `uk_companies_act.py` **✅ EXTRACTED touch-2 2026-08-10** | [GOV.UK filing calendar](https://www.gov.uk/prepare-file-annual-accounts-for-limited-company) — Open Government Licence v3.0 | UK regulatory-filing calendar entries — Companies House annual accounts, Corporation Tax, Company Tax Return, confirmation statement (all verbatim durations). Enables the `reg-feed-watcher` skill to emit UK-jurisdiction deadline reminders. |

## Still pending

- **Touch-2 extraction itself.** All four proposed artefacts (3 `.py` scripts + 1 `.md` per §8.9) are candidates, not code.
- **Heineman, *The Inside Counsel Revolution*.** Paywalled. If the operator later drops the book in `Agents/_books/`, extract as an additional Route D source alongside script #3 (`obligation_attestation_review`) and Brandeis's writings — Heineman is the modern operator-side voice on the same theme.
- **Regimes catalog expansion.** `comply-config.md`'s `Regimes catalog` section starts empty; operator populates per venture / jurisdiction. Not a book requirement, but a downstream config debt that touch-2 depends on for `regime_lookup_engine`.
