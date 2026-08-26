---
agent: guard
department: Legal & Compliance
type: logical-book-requirements
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# guard · logical / book-requirements

> **Touch 1 placeholder** (playbook §8.1). Books identified via the §8.12 end-of-agent step; §8.8a 3-attempt hunt applied dept-wide during scribe's build. No scripts extracted yet; every 0.6-flagged judgment below is reasoning-based until touch 2.

---

## Proposed scripts for touch-2 (§8.0 minimum-two-books-per-script)

Path chosen 2026-07-29: **Path 1 — all-free build.** No paywalled books required for Tier A.

| # | Proposed script | Route | Source book #1 (★) | Source book #2 | Notes |
|---|---|---|---|---|---|
| 1 | `trademark_confusion_factors` | B | USPTO TMEP (Trademark Manual of Examining Procedure) — [USPTO](https://tmep.uspto.gov/) | WIPO IP Handbook — [WIPO](https://www.wipo.int/edocs/pubdocs/en/wipo_pub_489.pdf) | Grounds `clearance` knockout bars + confusion-factor walk (du Pont / Polaroid / Sleekcraft); Route B rule-engine deterministically classifying knockout categories. |
| 2 | `oss_license_classifier` | B | OSI Approved Licenses list (spdx.org, opensource.org) — free institutional | FSF license list + Software Freedom Conservancy guidance — free | Grounds `oss-review` classification into permissive / weak-copyleft / strong-copyleft / non-OSI / unknown. Route B — deterministic SPDX ID → bucket + obligation mapping. |
| 3 | `deployment_model_obligation_mapper` | B/C | OSI / FSF license text (as above) | Google SRE + SFC field guides on OSS in production | Grounds `oss-review` Step 4 — for each (license, deployment_model, linking_relationship) tuple, output the obligation list + severity. Hybrid Route C — deterministic aggregation over judgment on linking-relationship classification. |
| 4 | `ip_renewal_calendar_computer` | A | USPTO TMEP maintenance schedules + EPO/EUIPO/UKIPO renewal fee schedules — free official | UNIDROIT Principles for jurisdiction-neutral defaults where operator hasn't declared | Grounds `ip-registry` Step 3 (renewal) and Step 7 (calendar). Route A math — deterministic days-to-expiry, lead-time-required, fee-estimate per jurisdiction × asset-class. |

**Tier assessment (§8.4):** all 4 Tier A candidates → flag removable on touch-2.

**Source authentication (§8.8):**
- **Institutional:** USPTO (US federal), EPO / EUIPO / UKIPO (intergovernmental / national IP offices), WIPO (intergovernmental), UNIDROIT (intergovernmental), OSI + FSF + SFC (steward institutions).
- Named + verifiable; no unattributed sources.

**Whole-book access (§8.10):** USPTO TMEP is direct-web (all chapters). WIPO handbook is direct-PDF. OSI/FSF license lists are direct-web (canonical). SRE books are free at sre.google. UNIDROIT is direct-PDF. Fee schedules are direct-web at each IP office.

---

## Inherited scripts

None yet. If a future logical script (e.g. `oss_license_classifier`) is extracted for guard first, other agents that touch OSS (any dept building software) inherit rather than duplicating (§13.5).

---

## Skills → proposed script mapping

| Skill | Imports from `Shared OS/logical/` (touch-2) | Rationale |
|---|---|---|
| `clearance` (marketplace, via wrapper) | `trademark_confusion_factors` (#1) | Knockout bars + confusion-factor walk currently reasoning-based; grounded touch-2 |
| `oss-review` (marketplace, via wrapper) | `oss_license_classifier` (#2) · `deployment_model_obligation_mapper` (#3) | License classification + obligation mapping — both currently reasoning-based |
| `infringement-triage` (marketplace, via wrapper) | `trademark_confusion_factors` (#1) — TM mode only; patent + copyright + trade-secret modes remain reasoning-based pending route-D sources | Partial grounding — patent claim charts and fair-use analysis need specialist sources beyond Path 1 |
| `ip-registry` | `ip_renewal_calendar_computer` (#4) | Days-to-expiry, lead-time, fee computation — currently reasoning-based defaults |
| `ip-routing` | — | Wrapper skill; no logical grounding needed |

---

## Flag clearance (0.6 audit — playbook §8.5)

Current state: **all guard judgments below are reasoning-based** pending touch-2.

| Judgment | Skill(s) | Current state | Cleared by (touch-2) |
|---|---|---|---|
| Knockout-bar categorisation (generic / descriptive / geographic / surname / etc.) | `clearance` | reasoning-based | script #1 |
| Confusion-factor direction (senior / accused / mixed) per factor | `clearance` · `infringement-triage` (TM mode) | reasoning-based; framework itself Tier B (well-known circuit tests) | script #1 |
| License → classification bucket (permissive / weak-copyleft / etc.) | `oss-review` | reasoning-based; SPDX IDs are Tier B | script #2 |
| Obligation triggering for (license, deployment, linking) tuple | `oss-review` | reasoning-based | script #3 |
| Days-to-expiry alert bucketing (overdue / ≤30 / ≤60 / ≤90) | `ip-registry` | arithmetic is deterministic; the thresholds are operator-set config, defaults are §0.6-flagged | script #4 |
| Copyright fair-use factor direction | `infringement-triage` (copyright mode) | reasoning-based | NOT covered by Path 1 sources; needs Route D fair-use casebook (deferred) |
| Patent claim-chart element mapping | `infringement-triage` (patent mode) | reasoning-based | NOT covered by Path 1; needs patent-claim-chart methodology source (deferred) |
| Trade-secret reasonableness assessment | `infringement-triage` (trade-secret mode) | reasoning-based | NOT covered by Path 1; needs UTSA/DTSA case-law source (deferred) |

---

## Still pending

- **Touch-2 extraction itself** for the 4 Path-1 scripts above.
- **Fair-use casebook** for copyright infringement-triage mode. Candidates: *Cariou v. Prince* casebook material (public via court records); Nimmer on Copyright (paywalled). Path 1 does not close this; needs later Route D pass.
- **Patent claim-chart methodology.** Candidates: MPEP (USPTO Manual of Patent Examining Procedure — free); Chisum on Patents (paywalled). MPEP is free and would ground the utility-patent framework at Tier A.
- **Trade-secret case law.** Candidates: DTSA statute text (free); Milgrim on Trade Secrets (paywalled). Statute alone is Tier B; needs case-law source for full Tier A.
- **Design-patent specialist source.** *Egyptian Goddess* + subsequent Fed. Cir. cases are free (US Reports); this is a shorter Route B extraction if operator wants it.
- **Ken Adams / drafting-conventions source** (from scribe's book-requirements) is not relevant to guard.

Add-later paywalled options (operator can drop in `Agents/_books/`):
- Nimmer on Copyright — comprehensive copyright doctrine
- Chisum on Patents — patent-claim methodology + defense analysis
- Milgrim on Trade Secrets — trade-secret case-law depth
