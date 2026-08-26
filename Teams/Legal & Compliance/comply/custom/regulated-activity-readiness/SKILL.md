---
name: regulated-activity-readiness
type: custom
status: built from scratch
assigned_agent: comply (Legal & Compliance / Compliance Lead — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "For a proposed feature or venture activity, checks whether it triggers a licensing / registration / notification regime in any watched jurisdiction. Blocks launch if unreviewed. Genericised from vyon-fintrac-readiness (which hardcoded one venture + one regulator) — this skill is regime-agnostic and jurisdiction-parametric per playbook §0.4b."
triggers:
  - is this feature regulated
  - do we need a licence
  - does this trigger a regime
  - regulated activity check
  - launch gate
  - can we ship this
  - readiness check for [activity]
  - does this feature need registration
  - pre-launch compliance review
---

# Regulated-Activity Readiness

## Introduction

Built from scratch on 2026-07-29 as comply's pre-launch gate. Before a proposed feature or venture activity ships, this skill checks whether it triggers a licensing, registration, notification, or supervisory regime in any of the jurisdictions comply watches. If it does, launch is gated until the regime is complied with; if it doesn't, the answer is `clear` with a one-line justification.

Genericised from the catalog's `vyon-fintrac-readiness`, which named a specific venture ("Hourbour") and a specific regulator (FINTRAC/OSFI). Neither survives here: the *activity classification* (money service, health data processing, credit issuance, insurance intermediation, broker-dealer, etc.) is the input; the *regime lookup* is against comply's live register + operator-declared jurisdictions.

## Purpose

For a proposed activity, produce a decision:

- **CLEAR** — no regime triggered in any watched jurisdiction. Include the classification and the jurisdictions checked.
- **CONDITIONAL** — regime triggered, but there is a documented compliance path (existing licence, notification-only, sandbox exemption). Include what compliance requires and who owns it.
- **BLOCKED** — regime triggered and no compliance path currently exists. Launch gated until: (a) licence obtained, (b) exemption confirmed, or (c) activity scope reduced to fall outside regime.

Every decision routes to `obligation-register`: if CONDITIONAL or BLOCKED, the associated obligations are added there so nothing gets forgotten after launch.

## When to Use

- Operator says "is this feature regulated" · "do we need a licence" · "does this trigger a regime" · "regulated activity check" · "launch gate" · "can we ship this" · "readiness check for X" · "does this feature need registration" · "pre-launch compliance review".
- Product or engineering surfaces a new feature spec — this skill is the pre-launch gate.
- New market entry (a venture launching in a new jurisdiction) — this skill runs against the *jurisdiction* dimension.

Do NOT use for:

- Ongoing compliance status of an already-live activity — that's `obligation-register` retrieval.
- Regulator feed monitoring — that's `reg-monitor-routing`.
- Contract clauses required by a regime — that's `scribe`'s domain (this skill *identifies* the need; scribe implements).

## Structure / Protocol

```
1. INTAKE      operator supplies proposed activity + jurisdictions + venture
2. CLASSIFY    map the activity to regulated categories (money-service / health-data / etc.)
3. LOOKUP      for each (category, jurisdiction) tuple, look up applicable regimes
4. ASSESS      for each triggered regime: existing compliance path? or gap?
5. DECIDE      CLEAR | CONDITIONAL | BLOCKED
6. ROUTE       CONDITIONAL/BLOCKED → obligation-register + Governance/board per config
7. RETURN      decision + rationale + next steps
```

## Instructions

### Step 1: Intake

Operator supplies (never invent — ask if missing):

- **activity_description** — plain-language description of the proposed feature or activity (2–5 sentences)
- **venture** — which venture is proposing it
- **jurisdictions** — where the activity will be offered (one or more)
- **launch_target_date** — YYYY-MM-DD (drives the escalation urgency)
- **user_types** — retail / SMB / enterprise / regulated-entity (some regimes apply only to consumer-facing offerings)
- **data_categories** — what kinds of data will be collected/processed (PII / financial / health / biometric / children / …)
- **money_flow** — does the activity involve custody or transmission of funds? issue credit? extend deposits? offer investment products? (Y/N for each)

If any is missing, ask. Do not guess.

### Step 2: Classify

Map the activity to one or more regulated categories. Use a fixed taxonomy (extensible via operator, never invented per-request):

| Category | Signals |
|---|---|
| money-services / payments | Custody / transmission of funds; wallet; on-off ramps |
| lending / credit | Consumer or SMB credit extension; BNPL; factoring |
| deposit-taking | Holding customer funds > operational float |
| investment / broker-dealer | Securities offering, brokerage, RIA activity |
| insurance | Underwriting, intermediation, warranty products framed as insurance |
| health-data | Processing of protected health information (PHI, PII-health) |
| children-data | Any service directed at users under 13 (or under 16 in EU/UK) |
| biometric-data | Fingerprint, face, voice, retina, gait |
| credit-reporting | Furnishing consumer credit data or consumer-facing scores |
| gambling / gaming | Prize-with-consideration, sweepstakes structure, real-money games |
| telecom / spectrum | Voice / SMS at scale, carrier peering, spectrum use |
| export-controlled | Encryption, dual-use goods, sanctions-touching customers |
| other | Genuinely novel — flag and route to operator |

Multiple categories can apply. Annotate why each match was made from Step 1 signals.

### Step 3: Regime lookup

For each `(category, jurisdiction)` tuple, consult:

1. `obligation-register` — is there already an active obligation covering this category in this jurisdiction? If yes, an existing compliance path likely exists.
2. `comply-config.md` `Regimes catalog` section — for each declared jurisdiction, which regimes apply to which categories?
3. If neither has an entry, mark as `UNKNOWN — needs research` and add to Step 5's list of gaps rather than guessing (playbook §0.5).

Produce a table: category × jurisdiction → regime + status.

### Step 4: Assess

For each triggered regime:

- **Existing licence / registration** → CONDITIONAL, subject to scope check (does the existing licence cover the *proposed* activity?)
- **Notification-only** → CONDITIONAL, with the notification date + form the obligation
- **Sandbox exemption available** → CONDITIONAL, with the sandbox conditions
- **Full authorisation required, none held** → BLOCKED
- **UNKNOWN** → BLOCKED pending research

### Step 5: Decide

- All rows CLEAR → **CLEAR**
- All rows CLEAR or CONDITIONAL → **CONDITIONAL**
- Any row BLOCKED → **BLOCKED**

Never soften a BLOCKED to CONDITIONAL to make the operator's life easier (playbook §0.7).

### Step 6: Route

- **CONDITIONAL / BLOCKED** → hand off to `obligation-register` to add the applicable regime obligations (with owner + due date). Do this before returning to the operator so nothing is committed to launch without the register updated.
- **BLOCKED** at launch date < 90 days → escalate L2 per `comply-config.md` Escalation matrix. If regime is on the `always L3` list (money-transmitter licensure, banking, securities, health-data), escalate L3 to `Governance/board`.
- **CLEAR** → no routing; just record the check.

### Step 7: Return

Return the decision:

- Preamble: `Activity: [description]. Venture: [name]. Jurisdictions: [list]. Launch: [date]. Verdict: [CLEAR|CONDITIONAL|BLOCKED].`
- Body: category-by-jurisdiction table showing regime + status.
- Rationale: one paragraph per BLOCKED / UNKNOWN row explaining why the launch is gated.
- Next steps: numbered actions with owners, tied to the register entries just created.

## Output Format

Fixed shape:

```
## Readiness check: [activity title]

**Verdict:** [CLEAR | CONDITIONAL | BLOCKED]
**Venture:** [name]
**Jurisdictions:** [list]
**Launch target:** [date]

### Categories triggered
| Category | Signal from activity | Jurisdiction × Regime |
|---|---|---|

### Regimes assessed
| Regime | Jurisdiction | Status | Compliance path |
|---|---|---|---|

### Rationale for BLOCKED / UNKNOWN rows
[one paragraph per row]

### Next steps
1. [owner] — [action] — [due]
2. …

### Register entries created
- [slug 1]
- [slug 2]
```

## Principles

- **No invented regimes.** If a jurisdiction × category tuple is not in `obligation-register` or the regimes catalog, it is `UNKNOWN`, not "probably fine" (playbook §0.5).
- **BLOCKED never softens to CONDITIONAL** for convenience. The decision reflects the state, not the launch pressure (playbook §0.7).
- **Every triggered regime becomes an obligation** in the register before the operator sees the verdict — do not report a CONDITIONAL result without the corresponding register entry.
- **Novel categories require operator classification.** If the activity clearly maps to `other`, stop and ask before proceeding — expanding the taxonomy is a build decision, not a per-request decision.
- **Data + money-flow flags drive most triggers.** Signals in Step 1 are what surface most regime triggers; missing signals are the biggest risk (playbook §0.5 — ask, don't infer).

## Fallback

| Failure mode | Response |
|---|---|
| Required intake field missing | Ask the operator; do not proceed |
| Activity maps only to `other` category | Halt; ask the operator to classify or expand the taxonomy — do not invent |
| Jurisdiction not in `comply-config.md` `Jurisdictions in scope` | Halt; the operator must declare the jurisdiction first |
| Regime lookup returns UNKNOWN for critical categories (money-service, health-data, securities) at launch < 30 days | Auto-escalate L3 to `Governance/board` — do not sit on it |
| `obligation-register` write fails | Halt; do not return a CONDITIONAL / BLOCKED verdict without the register updated |

## Boundaries with Other Skills

- **`reg-monitor-routing` (custom, this agent)** — no direct handoff. Feed monitoring surfaces *changes in regimes*; this skill applies regimes to *proposed activities*.
- **`obligation-register` (custom, this agent)** — this skill *creates* register entries on CONDITIONAL / BLOCKED verdicts. One-directional: readiness → register.
- **`scribe` (Legal & Compliance)** — regimes that require contractual disclosure or DPA update → hand off to scribe for template implementation.
- **`Cybersecurity/warden`** — regimes that require internal controls (SOC 2, breach-response runbook) → warden owns control design.
- **`Governance/board`** — L3 escalation for BLOCKED regimes in high-risk categories.
- **`meta` (AI & Agents)** — if a proposed activity is *AI-related* and triggers the EU AI Act or a US AI executive order, meta is a co-consulted agent (AI governance sits under meta per fleet routing).
- **Shared OS: `verification-before-completion`** — inherited before the verdict is returned to the operator.

## Tool declaration (technical, not permission)

Per playbook §7 (`operational/tool/`), this list declares *technical needs*, not permission grants.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| regulated-activity-readiness | File read (config + register) · File write (via obligation-register handoff) | Web fetch (for regulator-catalog references when a jurisdiction is newly declared) | Steps 2, 3 (read config + register); Step 6 (write via handoff) |
