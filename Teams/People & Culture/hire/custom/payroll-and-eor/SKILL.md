<!--
Custom skill — adopted from the Anthropic hr-payroll-stinger plugin, then heavily
genericized per §0.4b and consolidated into a single SKILL.md.

Source plugin: /var/folders/.../claude-hostloop-plugins/.../skills/hr-payroll-stinger/SKILL.md
Same pattern as ats-selection: source SKILL.md references guides/, templates/, examples/,
research/, and reports/ subfolders but those files do NOT ship with the packaged plugin.
Per §0.5, this skill consolidates everything the source SKILL.md actually contains and does
NOT fabricate depth from empty references.

Genericization strip (§0.4b) applied:
- name: hr-payroll-stinger → payroll-and-eor
- "hr-payroll-worker-bee" (Legion invoker) → hire (this agent, per YVON routing)
- "security-worker-bee" (PII/SSN escalation) → veil (Cybersecurity — data protection)
- "auth-worker-bee" (SSO/SCIM provisioning) → keyring (Cybersecurity — IAM per CLAUDE.md §2)
- "db-worker-bee" (HR data schema) → dana (Engineering — Data per CLAUDE.md §2)
- "payments-worker-bee" (invoice payment flows) → operator (no payments agent in YVON)
- "library-worker-bee" (PRD authorship for people-ops features) → operator + spec (Product)
- "incorporation-startup-stack-worker-bee" (company formation) → operator + legal counsel
- "Stinger" / "Bee" / "Legion AI Army" / "stinger-forge" / "Command Brief" — stripped
- 2026 pricing bands, IRS 3-category test, California AB5, EU Platform Work Directive
  (Dec 2, 2026 deadline), Germany €50k misclassification penalty (2025), Minnesota PFML 2026,
  FLSA salary threshold ($35,568) — ALL KEPT VERBATIM (real regulatory/market data with citations)

Time-sensitive regulatory alerts kept as proactive-surface items per source Principle 3
(surface risk explicitly even if user didn't ask).

Escalation retargets (locked in this build):
- SSN/PII exposure in payroll API integrations → veil (data protection)
- SSO/SCIM identity provisioning for payroll platform → keyring (IAM)
- HR database schema design (custom tables) → dana (data engineering)
- PRD authorship for people-ops features → operator + spec
- Contractor invoice payment / AP flows → operator (no payments agent in YVON)
- Company formation before setting up payroll → operator + legal/incorporation counsel
- Immigration / visa strategy → operator + immigration attorney (source's correct answer)
- Deep accounting-software selection beyond payroll integration → operator + future Finance agent

The 4 hard rules from source are preserved verbatim in §Principles — especially the
misclassification liability warning (up to 3 years back taxes for negligent, 6 years
intentional) which is the highest-consequence rule in this skill.
-->
---
name: payroll-and-eor
type: custom
status: adopted from marketplace source, genericized and consolidated
sources_referenced:
  - "Anthropic knowledge-work-plugins — hr-payroll-stinger plugin (2026-07-06 packaged version). SKILL.md is the sole shipping file; referenced guides/, templates/, examples/, research/, reports/ subfolders were not included in the package."
  - "IRS Independent Contractor (Self-Employed) or Employee — the 3-category common-law test (behavioral control, financial control, type of relationship). Federal baseline."
  - "California AB5 (Assembly Bill 5, 2019, as amended) — the ABC test for worker classification in California."
  - "Germany Statutory Sick Pay & Scheinselbständigkeit rules (2025 update) — €50,000 penalty per misclassification introduced."
  - "EU Platform Work Directive — December 2, 2026 transposition deadline."
  - "Fair Labor Standards Act (FLSA) — salary threshold $35,568 (as restored after 2024 court ruling)."
  - "Minnesota Paid Family and Medical Leave — launching 2026."
fulfills_catalog_entry: n/a (skill added beyond the catalog's 8-skill floor per §2)
genericization_notes:
  - "'Stinger' / 'Bee' / 'Legion AI Army' wrapper terminology stripped."
  - "security-worker-bee → veil; auth-worker-bee → keyring; db-worker-bee → dana."
  - "payments-worker-bee, library-worker-bee, incorporation-startup-stack-worker-bee → operator + relevant real YVON agent where one exists."
assigned_agent: hire (People & Culture / Lead)
portable: true
date_added: 2026-07-29
tier: 3
description: Domestic payroll platform selection (Gusto, Rippling, Justworks), international contractor management and EOR (Deel, Remote.com, Oyster, Rippling Global), the W-2/1099/EOR/PEO classification matrix, equity admin handoff (Carta), and benefits brokerage. Trigger on "Gusto vs Rippling", "set up payroll", "EOR for international hire", "contractor vs employee", "W-2 or 1099", "Deel vs Remote", "benefits for our startup", "equity admin and payroll", or "we hired someone in [country]".
triggers:
  - Gusto vs Rippling
  - set up payroll
  - EOR for international hire
  - contractor vs employee
  - W-2 or 1099
  - Deel vs Remote
  - set up Justworks
  - benefits for our startup
  - equity admin and payroll
  - we hired someone in
  - multi-state payroll
  - migrate payroll from
---

# Payroll and EOR

## Introduction

This skill covers the five decision moments a growing company hits in its people-ops lifecycle: (1) which domestic payroll platform to pick, (2) how to classify each worker (W-2 vs 1099 vs EOR vs PEO), (3) how to hire internationally without setting up a foreign entity (EOR path), (4) what benefits stack to offer, and (5) when to connect equity admin (Carta) into payroll. Adopted from Anthropic's `hr-payroll-stinger` plugin, genericized per §0.4b (Legion / Bee / Stinger wrapper terminology stripped; escalation routing retargeted to real YVON agents: **veil** for PII, **keyring** for IAM/SSO, **dana** for HR data schema).

Content that came from the source plugin is preserved verbatim where it is factual (2026 pricing bands, IRS 3-category test, California AB5, EU Platform Work Directive deadline, Germany €50k penalty). Content that would have required fabricating depth from empty referenced folders (source's `guides/00-principles.md` through `guides/07-migration-playbook.md`) is consolidated into `## Instructions` sub-sections rather than manufactured — per §0.5.

## Purpose

Prevents four categories of failure that occur when hire runs the loop without a considered payroll/classification setup:

1. **Wrong platform for the stage.** Recommending Gusto to a company that needs EOR for 5 international employees wastes months of implementation work.
2. **Misclassification liability.** 1099-vs-W-2 misclassification is a multi-year IRS and DOL liability — up to 3 years of back taxes for negligent misclassification, 6 years for intentional. This is the highest-consequence risk this skill exists to prevent.
3. **International-hire dead-ends.** Hiring in Germany / UK / Brazil without an EOR (Employer of Record) means either setting up a foreign entity (6–12+ months) or hiring illegally.
4. **Equity admin misalignment.** Connecting Carta to payroll at the wrong time creates duplicate records, wrong tax withholding on RSU vests, and painful clean-up.

## When to Use

Trigger on:

- "Gusto vs Rippling — which should we use?" / "Rippling vs Justworks"
- "We just hired our first employee in [country]" / "how do we pay them?"
- "Is [person] a 1099 contractor or W-2 employee?" / "should we reclassify?"
- "We need to hire in Germany / UK / Brazil — EOR or our own entity?"
- "We just closed [round] — do we need Justworks for benefits?"
- "Should we set up Carta before or after payroll?"
- "What are our multi-state payroll compliance obligations?"
- "We're moving from Gusto to Rippling — what's the process?"
- "We have N US W-2 employees and M international contractors — one platform or split?"

Do NOT use for:

- Performance management, OKRs, 1:1s → `merit` (Performance Mgmt, when built).
- Recruiting, ATS platforms, offer letter mechanics → `ats-selection` (this agent) + `hiring-kit` (this agent).
- Immigration / work visa strategy → operator + immigration attorney (outside YVON fleet).
- Accounting software selection beyond payroll integration → operator + future Finance agent.
- SSO/SCIM identity provisioning for the payroll platform → **keyring** (Cybersecurity — IAM).
- HR data schema design for custom tables → **dana** (Engineering — Data).
- Contractor invoice payment flows and AP → operator (no payments agent in YVON).
- PRD authorship for people-ops features on the internal product → operator + `spec` (Product).

## Structure / Protocol

Every request runs through this order — classify → size → recommend → surface risk → hold the legal fence. Never skip the first two steps even when the user seems impatient.

```
1. CLASSIFY   Worker engagement model first (W-2 / 1099 / EOR / PEO). Platform second.
2. SIZE       Headcount (current + 12-month projection), US states with employees,
              countries with workers, funding stage, equity maturity.
3. RECOMMEND  Route to Topic A-G below per the intake answers.
4. SURFACE    Misclassification risk, unfilled PII/GDPR escalation, imminent regulatory
              deadlines (EU Platform Work Directive, PFML state launches) — proactively,
              even if the user did not ask.
5. FENCE      Legal-advice fence: this skill provides decision frameworks, not legal
              opinions. Employment attorney and CPA called out at every decision branch
              that has tax or employment-law consequences.

Topic routing:
  "Gusto vs Rippling?" / "set up domestic payroll"    → Topic A: Platform selection
  "W-2 vs 1099 vs EOR?"                               → Topic B: Classification matrix
  "Hire in [country]?"                                → Topic C: International EOR
  "Which benefits should we offer?"                   → Topic D: Benefits brokerage
  "When do we connect Carta?"                         → Topic E: Carta handoff
  "What compliance traps should we know?"             → Topic F: Compliance hotspots
  "Moving from [X] to [Y]"                            → Topic G: Migration
```

## Instructions

### Topic A — Domestic payroll platform selection

Ask the SIZE questions if not already answered, then apply the platform decision matrix:

| Platform | Best fit | 2026 pricing band (verify at vendor) |
|---|---|---|
| **Gusto Simple** | Small teams (~1–50 employees), US-only, budget-conscious | ~$40–$49 base + $6–$12/employee |
| **Rippling** | 20+ employees, teams that value one-system unification (payroll + HRIS + IT + IAM), modular buyers | ~$8 base + modules; typical $20–$30/employee total |
| **Justworks** (PEO) | Small teams that want health benefits bundled and are OK ceding some employer-of-record on the PEO model | ~$59–$99/employee (benefits bundled) |
| **Paychex Flex** | Enterprise scale, complex multi-state; custom quoted | enterprise custom pricing |

**Rippling shortcut:** if the team is already choosing an HRIS-first model and needs SSO/IT provisioning integrated with payroll, Rippling is often the single-answer even when payroll alone doesn't demand it.

**Open pricing questions from source research (verify before finalizing):**
- Gusto Simple base: $40 vs $49 — verify at gusto.com/pricing.
- Rippling modular total: $20–$30/employee estimate — Rippling requires demo for exact pricing.
- Do NOT quote a specific number as authoritative — pricing is custom-quoted or revised frequently. Always give ranges with "verify with vendor" per Principle 5.

### Topic B — W-2 vs 1099 vs EOR vs PEO classification matrix

This is the highest-consequence topic in the skill. Misclassification liability: **up to 3 years of back taxes for negligent misclassification, 6 years for intentional** (US IRS/DOL baseline). Additional state-level penalties (California AB5, Germany €50k) stack on top.

Decision inputs:
1. Where does the worker perform the work? (US state / country)
2. Who controls how, when, and where the work is done? (Behavioral control — the first IRS common-law test category)
3. Who provides tools, sets rate, bears profit/loss risk? (Financial control — second category)
4. Is the relationship ongoing, exclusive, integral to the business? (Type of relationship — third category)
5. Is this worker also serving other clients?
6. Duration and nature of the engagement?

Routing:

| Situation | Classification | Rationale |
|---|---|---|
| US-based, you control how/when/where, tools you provide, ongoing | **W-2** | IRS 3-category test defaults to employee under these conditions |
| US-based, worker sets own hours + tools + serves other clients + short-scope engagement | **1099** (with IRS-test defensibility check) | Passes IRS 3-category test — DOCUMENT the reasoning |
| California worker, most professional service roles | **W-2** (AB5 ABC-test presumption) | AB5 flips presumption to employee; must overcome ABC test to stay 1099 |
| Non-US worker, no local entity, want them W-2-equivalent | **EOR** (Deel / Remote / Oyster / Rippling Global) | EOR becomes their legal employer in-country |
| Small US team, want health benefits bundled + shared employer-of-record | **PEO** (Justworks) | PEO's co-employment model gives benefits scale + admin offload |

**Route to veil** if the worker-classification analysis surfaces PII/SSN handling in the answering platform (e.g., 1099-K threshold crossings, W-9 storage). Route to **operator + employment attorney** at every California AB5 branch and at every "close-call" 1099 designation — do not resolve borderline classification calls without counsel.

### Topic C — International EOR (Employer of Record)

When to use EOR vs setting up own entity:

- **EOR** — hiring 1–5 employees in a country, timeline urgent (<3 months), unclear long-term commitment. Fast (2–4 weeks); higher per-employee cost.
- **Own entity** — hiring 10+ employees in a country, long-term commitment, need to accept local government contracts or grants. Slow (6–12+ months); lower per-employee cost at scale.

EOR platform pricing bands (2026, verify at vendor):

| Platform | EOR (employee/month) | Contractor (contractor/month) |
|---|---|---|
| **Deel** | ~$599 | ~$49 |
| **Remote.com** | ~$599 | ~$29 |
| **Oyster** | ~$499 Essentials / ~$599 standard | ~$29 |
| **Rippling Global** | custom | custom |

**Open verification items from source:**
- Deel–Carta integration status: Carta does NOT list Deel as a direct integration partner — verify before promising a specific handoff mechanic.
- Oyster Essentials $499 vs $599 tier — verify at oysterhr.com/pricing.

**Regulatory alerts to surface proactively (source Principle 3):**

- **EU Platform Work Directive** — December 2, 2026 transposition deadline. Any team with EU-based platform / gig-style workers must have their EU classification model reviewed before that date; changes the presumption for platform workers toward employee status in most member states.
- **Germany** — introduced a **€50,000 penalty per misclassification** in 2025. Higher stakes than the US federal baseline. Any German 1099-equivalent (Freelancer / Scheinselbständigkeit borderline) must be reviewed with German employment counsel before hire, not after audit.

### Topic D — Benefits brokerage

Options for small teams:

- **Platform-native benefits** (Gusto Benefits, Rippling Benefits) — good for straightforward small-team packages, single-carrier medical, standard dental/vision.
- **PEO-bundled benefits** (Justworks) — access to Fortune-500-scale plan pricing via co-employment; trade-off is less flexibility on specific carriers.
- **ICHRA / QSEHRA** (Individual Coverage HRA / Qualified Small Employer HRA) — reimbursement model where the employer contributes to individually-owned plans instead of a group plan. Increasingly popular for distributed teams where a group plan can't cover everyone.
- **Traditional brokered plans** — separate brokerage relationship, works with any payroll platform, higher setup effort but full flexibility.

Do not recommend a benefits path without knowing: team distribution (single-state vs multi-state vs multi-country), funding stage / cost tolerance, existing benefits (are we breaking a promise if we downgrade?), and whether the team has active health-plan needs (chronic conditions, dependents) that a limited plan would not cover.

### Topic E — Carta handoff (equity admin)

**When to connect Carta:**

- Before payroll: option grants can be issued from Carta before the first W-2 payroll runs. This is fine and common.
- After payroll: for RSU vests (which are taxable events with withholding), Carta must be connected to payroll BEFORE the first RSU vest, or the vest will produce incorrect withholding that has to be reconciled through amended W-2s (painful).

**Integration status verification:** the source flagged that Deel–Carta integration is not documented as a direct partner. Verify current integration status at both carta.com/integrations and the payroll vendor's docs before promising a mechanic. Route to operator + tax counsel at every "we're about to have our first vest" decision point.

### Topic F — Compliance hotspots

- **Multi-state nexus.** If any employee lives in a state, the company has payroll-tax nexus there. This ratchets up fast for remote-first teams.
- **California AB5** — flips the classification presumption toward employee. Cases:
  - Doctors, lawyers, licensed professionals: various carve-outs; check the current AB5 amendment list.
  - Freelance writers: originally limited to 35 submissions/year; amended in later legislation.
  - Truck drivers, gig-economy workers: heavily contested; check current status.
- **FLSA salary threshold** — currently $35,568 after 2024 court ruling; verify at dol.gov after any federal court ruling or DOL rulemaking (this number moved twice between 2023 and 2025).
- **PFML (Paid Family and Medical Leave) state programs** — expanding. Confirmed launching 2026: **Minnesota**. Source flagged 2 additional states launching 2026 as open verification items — check state DOL sites before payroll setup for any new-state hire.
- **PII handling on payroll APIs** — SSNs and bank-account data are the highest-sensitivity PII in the org. Route any custom API integration through **veil** (data protection) before it goes live. SSO/SCIM provisioning routes to **keyring** (IAM).

### Topic G — Migration playbook

The source's dedicated migration guide (`guides/07-migration-playbook.md`) was not included in the packaged plugin. What is inherited and verifiable:

- **Never migrate mid-quarter.** Payroll is quarterly-tax-cycle heavy; migrating mid-quarter creates two partial-quarter tax filings and doubles the chance of an error.
- **Preferred migration window:** end of calendar year (aligns with W-2 issuance) or end of Q1 (before mid-year complexity accrues).
- **Data mapping is the risk.** Direct-deposit accounts, tax withholdings, benefits deductions, garnishments, PTO balances — every one has to map, and the source and target systems categorize them differently. Cutover requires a parallel-run week where both systems ingest but only one pays.
- Deeper migration playbook (`<FILL_IN>` — needs a payroll-migration handbook or a book grounded in real migrations; source cited no book).

## Output Format

Each invocation produces one of:

- **Platform recommendation memo** — 3-question intake answers restated, recommended platform(s), classification implications, pricing band with "verify with vendor" note, open questions the operator must resolve.
- **Classification worksheet** — for a specific worker: IRS 3-category test walkthrough, California AB5 ABC-test check if applicable, non-US EOR consideration if applicable, recommended classification with defensibility notes.
- **EOR-vs-entity decision memo** — hire count in country, timeline, long-term commitment, cost comparison, recommendation.
- **Benefits recommendation memo** — team distribution, funding stage, benefits path recommendation with tradeoffs.
- **Carta-handoff timing memo** — grant type (options / RSU), first-vest expected date, integration verification status, recommendation.
- **Compliance audit checklist** — multi-state nexus check, AB5 exposure check, FLSA salary check, PFML state check, PII handling check, findings with severity + fix.
- **Migration plan** — source system, target system, cutover window, parallel-run schedule, data-mapping checklist, escalation contacts.

## Principles

The **4 hard rules** from the source plugin — every recommendation must honor them.

1. **Classify before recommending.** Worker engagement model first (W-2 / 1099 / EOR / PEO); platform second. Recommending Gusto to a company that needs EOR for 5 international employees wastes months.
2. **Size the company every time.** Headcount (current + 12-month projection), US states with employees, countries with workers, funding stage, equity maturity — all inputs to the recommendation. Do not skip.
3. **Surface misclassification risk explicitly.** Prominently, not in a footnote. Up to 3 years back taxes for negligent misclassification (6 years intentional) federally; +€50k per misclassification in Germany; +California AB5 penalties on top. This is the highest-consequence risk this skill exists to prevent.
4. **Hold the legal-advice fence.** Decision frameworks and risk flags, not legal opinions. "Consult an employment attorney" and "consult a CPA" are mandatory at every AB5/DOL analysis branch and at any tax-consequence decision.

Plus these adopted rules:

5. **Pricing is directional, never authoritative.** Every pricing number in this skill is a band that changes semi-annually and is often custom-quoted. Every recommendation names "verify with vendor" as an operator step.
6. **PII escalation is not optional.** Any SSN, bank account, or PII exposure in an integration or custom API call routes to **veil** before it goes live. Not "when convenient" — before.
7. **Time-sensitive regulatory alerts surface proactively.** The EU Platform Work Directive (December 2, 2026 deadline), Germany €50k penalty (2025), Minnesota PFML (2026), and FLSA threshold movement must be raised whenever the geography/topic touches them, even if the user did not ask.
8. **§0.6 flag:** classification and platform recommendations are matrix-driven judgment; regulatory citations are Tier-B canonical (IRS / state DOL / EU directive text). Reasoning-based per §0.6 until an HR-compliance book pair grounds a `Shared OS/logical/worker_classification.py`.

## Fallback

- **User can't answer the SIZE questions.** Do not recommend a platform. Say what's missing and ask. Silent guessing on any of the SIZE inputs produces the exact "right platform at the wrong stage" failure this skill exists to prevent.
- **Classification is genuinely close (worker meets some IRS-test criteria for each side).** Do NOT resolve. Route to operator + employment attorney with the IRS 3-category walkthrough documented. Close-call classification without counsel is how misclassification liability accrues.
- **User asks for exact pricing.** Give directional band + "verify with vendor" note. Never assert a specific dollar rate as authoritative.
- **International hire in a country not covered by the top-4 EOR platforms.** Route to operator with a request for a specialized EOR review; some countries have EOR coverage gaps (e.g., certain Central Asian and Sub-Saharan African markets).
- **RSU vest imminent and Carta not yet connected to payroll.** Escalate hard — this becomes a tax-withholding error window. Route to operator + tax counsel immediately; recommend a payroll integration freeze until Carta is connected.
- **User asks about accounting software selection beyond payroll integration.** Route to operator + future Finance agent (no Finance agent in YVON yet).
- **User asks about immigration / visa strategy.** Route to operator + immigration attorney. Source's correct answer; do not attempt to advise.
- **Company formation not yet complete but user wants to set up payroll.** Route to operator + incorporation counsel. Payroll pre-formation is not merely inefficient — it can invalidate the entity structure.

## Boundaries with Other Skills

| Hands off to | For | Direction |
|---|---|---|
| `hiring-kit` (custom, hire) | The hiring workflow that produces the offer accepted before this skill activates | Upstream: `hiring-kit` phase 7 hands off to this skill at accepted-offer |
| `ats-selection` (custom, hire) | Pipeline platform choice that feeds `hiring-kit` — different tool decision than payroll | Sibling; both under hire |
| `workforce-planning` (custom, hire) | Headcount + geographic distribution forecast that feeds the SIZE step of this skill | Upstream |
| `veil` (Cybersecurity — data protection) | SSN/PII handling in payroll APIs; GDPR right-to-erasure for candidate/employee records | Escalation |
| `keyring` (Cybersecurity — IAM) | SSO / SCIM provisioning for the payroll platform | Escalation for identity plumbing |
| `dana` (Engineering — Data) | HR-data schema design for any custom-table extension of the payroll platform | Escalation for data engineering |
| `board` (Governance — fiduciary-guard) | Budget approval on any spend > operator threshold (per fiduciary-guard's config); e.g., Deel EOR at scale is a real budget line | Escalation for spend approval |
| `Shared OS: verification-before-completion` | Evidence gate on every recommendation, especially close-call classification calls | Cross-cutting |
| Operator + employment attorney | Every close-call classification, every California AB5 borderline, every reclassification | Escalation — legal fence |
| Operator + tax counsel | Any RSU vest timing question, any multi-state tax nexus question | Escalation |
| Operator + immigration attorney | Any visa / work-authorization question | Escalation — outside YVON scope |
| Operator + incorporation counsel | Any pre-formation or entity-restructure question | Escalation — outside YVON scope |
| Future Finance department/agent | Long-term owner of accounting-software integration and cost-side budget mechanics | Placeholder for future YVON build |
| Future `merit` agent (P&C) | Performance-adjacent people-ops (bonus mechanics, RSU refresh grants tied to perf) | Sibling — future coordination |
