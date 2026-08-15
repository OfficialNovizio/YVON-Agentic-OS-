<!--
Custom skill — adopted from the Anthropic training-operations-administration plugin, then
genericized per §0.4b and reassigned from maslow to grove.

Source plugin: /var/folders/.../claude-hostloop-plugins/.../skills/training-operations-administration/SKILL.md
Note on the Python script: source SKILL.md references scripts/training_ops.py but that file
was NOT included in the packaged plugin. Per §0.5 the script is IMPLEMENTED-FROM-DESCRIPTION
here — the source describes audit-trail validation (all 4 required fields), days-until-expiry
computation, renewal-alert status (90-day lead time default), and completion-status rollup
by department.

Genericization strip (§0.4b):
- name: training-operations-administration → training-operations (trimmed)
- assigned_agent: maslow (CHRO) → grove (P&C / L&D)
- VYON / Hourbour / "Global Expansion (UAE/UK/USA)" (real dept, task #3 in build roster) → generic
- "People Analytics & Metrics" (VYON skill) → future Shared OS: people-analytics-metrics
- "Employee Wellbeing Monitoring" (VYON skill) → wellbeing-monitoring (custom, maslow — sibling)
- "Recruitment & Selection" (VYON) → hire's `hiring-kit` (real YVON skill)
- "Training Program Design" (VYON) → grove's own `training-program-design` (built-here)
- "Skills Gap Analysis" (VYON) → grove's own `skill-gap-map` (built-here)
- "comply (Legal)" → operator + employment counsel (no CLO agent in YVON)
- "CISO/comply" for access-control governance → veil (Cybersecurity — data protection)
  + operator
- "CISO/CDO remit" for access-control governance of audit-trail system → veil + operator
- "felix (Finance)" → board (fiduciary-guard); note future Finance agent

All 7 public-source citations preserved verbatim (LMSPedia, ProProfs, Vigilearn, Coggno x2,
HR Cloud, Absorb LMS, CypherLearning).

CRITICAL DISTINCTION FROM OTHER P&C SKILLS: this is the ONLY P&C skill where records must
stay individually identifiable BY LEGAL NECESSITY. Privacy protection here comes from
restricting who can access the records, NOT from anonymizing or aggregating them (opposite
of every other maslow/grove/merit skill). This inverts the default aggregate-only rule
from hire Universal Principle 7 — captured explicitly in Principle 3 below so the
inversion is visible, not implicit.
-->
---
name: training-operations
type: custom
status: adopted from marketplace source (Anthropic training-operations-administration plugin), genericized, reassigned from maslow to grove
sources_referenced:
  - "Anthropic knowledge-work-plugins — training-operations-administration plugin (2026-07-02 packaged version). SKILL.md only; referenced scripts/training_ops.py not included in package."
  - "LMSPedia — Automate Training Scheduling With an LMS."
  - "ProProfs — LMS Administrator Guide: Roles, Skills & Tools."
  - "Vigilearn — Corporate Compliance Training Audit Trail."
  - "Coggno — How to Build a Compliance Training Audit Trail; Enterprise Compliance Training Tracking Systems."
  - "HR Cloud — Compliance Audit Trail: Ensure Regulatory Adherence."
  - "Absorb LMS — Compliance training reporting 101."
  - "CypherLearning — Real-time compliance dashboards guidance."
fulfills_catalog_entry: n/a (part of grove's expanded roster beyond catalog's 2-skill floor per §2)
genericization_notes:
  - "Source-plugin author assignment maslow (CHRO) → grove (P&C / L&D) — reassignment."
  - "VYON / Hourbour / VYON-skill-names / felix / comply / CISO/CDO — stripped or retargeted per CLAUDE.md §2."
  - "'Global Expansion (UAE/UK/USA)' reference retargeted to the real Global Expansion department (task #3 in current build roster) once that department exists."
assigned_agent: grove (People & Culture / Learning & Development)
portable: true
date_added: 2026-07-31
tier: 3
description: The logistics + compliance-record-keeping layer of training — LMS enrollment automation, the 4-required-fields audit trail (person / course-code / timestamp / attestation), certification expiry tracking with proactive alerts (default 90-day lead time), and completion-status reporting by department/venture. Distinct from training-program-design (which owns content and evaluation). Trigger on "enrollment automation", "compliance audit trail", "certification expiry", "training compliance report", "audit training records", or "LMS setup for [scope]".
triggers:
  - enrollment automation
  - compliance audit trail
  - certification expiry
  - training compliance report
  - audit training records
  - LMS setup for
  - training completion by department
  - renewal alert
---

# Training Operations

## Introduction

This skill covers the **logistics layer** of training — enrollment automation, compliance
record-keeping, certification expiry tracking, and status reporting — as distinct from
`training-program-design` (grove — sibling, ships alongside this), which owns instructional
content and evaluation. This is the **most operationally strict skill in the People &
Culture set**: compliance training records carry legal / audit weight, and getting the
record-keeping wrong (missing fields, no audit trail, lapsed certifications discovered
too late) is a real regulatory exposure, not just an admin inconvenience.

Adopted from Anthropic's `training-operations-administration` plugin, reassigned from
maslow to grove (correct YVON owner), genericized per §0.4b.

**Critical distinction from every other P&C skill** (called out here because the
inversion is unusual and important): this is the **only** place in P&C where records
must stay **individually identifiable by legal necessity**. Regulators need to trace a
specific person's specific completion of a specific mandatory training. Privacy
protection here comes from **restricting who can access the records** (least-privilege
IAM), NOT from anonymizing or aggregating them (opposite of every other maslow/grove/merit
skill). This inversion is explicit in Principle 3 below.

## Purpose

As the org grows and expands across jurisdictions (Global Expansion department will ship
per task #3 in the current build roster; multiple national jurisdictions and cross-border
compliance surface), mandatory / compliance training needs to be tracked properly with
a single source of truth, complete audit trails, and proactive expiry management —
NOT scrambling to reconstruct records after an audit request or a lapsed certification
surfaces on its own.

Prevents four failure modes that show up when compliance training is run informally:

1. **Fragmented tracking.** Records split across spreadsheets, LMS, and email threads —
   fragmentation is itself a compliance risk.
2. **Incomplete audit trail.** Missing one of the 4 required fields (person, course-code,
   timestamp, attestation) means the record isn't legally sufficient — even if the
   training happened.
3. **Reactive expiry discovery.** Learning that a certification lapsed only when a
   regulator or partner asks for proof.
4. **Retention-period assumption.** Applying one blanket retention rule across all
   training types and jurisdictions — retention is regulation- and jurisdiction-specific
   and varies substantially.

## When to Use

Trigger on:

- "Enrollment automation" for a training program (by role, department, hire date, prerequisite)
- "Compliance audit trail" — build, audit, or investigate
- "Certification expiry" tracking / "renewal alerts"
- "Training compliance report" for a department / venture / the group
- "Audit training records" ahead of a regulatory request
- "LMS setup for [scope]" (system-of-record + enrollment rules configuration)
- Handoff from `hiring-kit` when a new hire triggers mandatory compliance training enrollment
- Handoff from `training-program-design` when a program needs its logistics layer

Do NOT use for:

- **Instructional design / content production** → `training-program-design` (grove — sibling).
- **Evaluating whether training worked** (Kirkpatrick levels, business-result attribution) →
  `training-program-design` (grove — sibling).
- **Individual perf evaluation** → future `merit` (Performance Mgmt).
- **Aggregate motivation or wellbeing pulse** → maslow's `motivation-map` / `wellbeing-monitoring`
  (which correctly stay aggregate/anonymous; opposite of this skill).

## Core Concepts

### Enrollment Automation

Rule-based triggers (job role, department, manager assignment, hire date, role change,
prerequisite completion) handle enrollment, calendar generation, reminders, waitlists,
and certificate delivery without manual admin work. Organizations report cutting
scheduling admin by roughly 60–70% once this is configured properly. Requires the
enrollment system to stay synced with current HRIS data. (LMSPedia; ProProfs)

### The Compliance Audit Trail — Four Required Fields

A legally sufficient training record needs ALL FOUR:

1. **Person identifier** — employee ID or full name (not both required; the org's chosen
   canonical identifier).
2. **Course / regulation code** — specific to the training / regulation being completed.
3. **Timestamp** — completion date/time (some regulations require both).
4. **Attestation** — a signed acknowledgement OR a scored assessment proving comprehension.

All four present = a record a regulator can verify without help from the org. Missing any
one = an incomplete record that must not be counted as compliant. `scripts/training_ops.py`
enforces the check via `validate_audit_trail()`. (Vigilearn; Coggno)

### Privacy Model — Access Control, Not Anonymization

Restated from the Introduction because this is load-bearing: **individually identifiable
by legal necessity.** The privacy protection is:

- **Least-privilege access to the audit-trail system** — a small, named set of people
  (typically: designated HR ops + operator/CFO for financial-audit adjacency + veil
  for data-protection governance). Everyone else has no read access.
- **Restrict who can view, manage, or configure** the audit-trail system.
- **Do NOT anonymize or aggregate compliance records** — that would defeat the
  regulatory verification the records exist for.

Governance for access control routes to **veil** (Cybersecurity — data protection) and
the **operator**, not to grove — grove maintains the records; veil + operator govern
who can see them.

### Retention and Immutability

- **Retention periods are regulation- and jurisdiction-specific.** For example, general
  OSHA training records are typically kept ~5 years from January 1 following the year of
  completion — but this varies by regulation and region. Never apply one blanket rule
  across all training types/jurisdictions without confirming the actual requirement.
- **Audit-trail entries are tamper-proof.** No one — including system administrators —
  edits or deletes existing regulatory log entries. Corrections get appended as new
  entries, not overwrites. Per Fallback rule 5.

(Coggno; HR Cloud)

### Single Source of Truth

Pick one system for compliance tracking rather than fragmenting records across spreadsheets
and tools. Fragmentation is itself an audit risk per Purpose failure mode 1. If records are
already fragmented, consolidation is the first step before any other work.

### Proactive Expiry Management

Track certification / training expiry dates and alert well before expiration. Default 90-day
lead time (via `scripts/training_ops.py`'s `expiry_alert_status()`) is a reasonable
starting default — override per operator policy in `grove-config.md` when built.

- **90+ days out:** OK.
- **90 days ≥ due ≥ 30 days:** ALERT (schedule renewal).
- **30 days > due ≥ 0:** URGENT (renewal must be scheduled).
- **Already expired:** EXPIRED (live compliance gap, escalate immediately per Fallback rule 4).

Real-time dashboards showing compliance status by department/venture support this.
(Absorb LMS; CypherLearning)

## Instructions

Follow this sequence when running training operations:

### Step 1 — Confirm a single system of record

For the training / compliance area in scope, confirm the one system that will hold the
records. If records are fragmented across tools, recommend consolidating BEFORE doing
anything else — per Fallback rule 2.

### Step 2 — Define enrollment automation rules

Specify which roles / departments / triggers auto-enroll people:

- **Role-based:** hire into a specific role → enroll in the role's mandatory training set.
- **Department-based:** joining a specific department (regulated ventures, finance, etc.).
- **Hire-date-based:** N days after hire → enroll in onboarding compliance.
- **Role-change-based:** promotion or lateral move → enroll in the delta.
- **Prerequisite-based:** completed course A → enroll in course B.

Confirm the trigger data source (HRIS or `hiring-kit` handoff feed) stays current. Stale
HRIS data means broken automation.

### Step 3 — For every compliance / mandatory training item, capture all 4 audit-trail fields

Person + course/regulation code + timestamp + attestation. Validate every record via
`scripts/training_ops.py`'s `validate_audit_trail()` before treating it as compliant. If
even one field is missing, the record is INCOMPLETE — do not count it, escalate per
Fallback rule 1.

### Step 4 — Confirm the retention period per training type / jurisdiction

Do NOT assume a blanket default. Route to operator + employment counsel per Universal
Principle 5 to confirm the specific retention requirement for the specific regulation and
jurisdiction. Multi-jurisdiction footprint (which will surface as the Global Expansion
department comes online per task #3) means retention often varies across the same
training type by location.

### Step 5 — Track expiry dates + generate renewal alerts

Use `scripts/training_ops.py`'s `expiry_alert_status()` with the default 90-day lead time
(operator-overridable in `grove-config.md` when built). Do NOT wait for a lapse to
surface on its own — that's the reactive-discovery failure mode this skill exists to
prevent.

### Step 6 — Roll up completion / compliance status by group

Use `scripts/training_ops.py`'s `rollup_completion_counts()` to produce dashboard-ready
counts by department / venture / role, flagging overdue and soon-to-expire items
explicitly.

Unlike other P&C skills, these rollups **may include identifiable data** (per Principle 3
inversion) if the audit-trail governance permits — but the audit-trail records themselves
stay in the restricted system, not in the dashboard artifact.

### Step 7 — Restrict access to the audit-trail system

Set up deliberately with **veil** (Cybersecurity — data protection) and the operator.
The list of people with read / manage / configure access should be small, named, and
periodically re-audited. This is a control governance activity, not just an admin task.

### Step 8 — Escalate patterns, not just individual gaps

If a whole team / department is behind on a mandatory course, flag it to the manager
AND to the operator + employment counsel. Don't just log individual lapses silently —
patterns indicate a systemic issue (workload conflict; unclear ownership; broken
enrollment automation) that individual escalations miss.

## Python Utility

`scripts/training_ops.py` provides:

- `validate_audit_trail(record)` — checks all 4 required fields present and non-empty;
  returns (ok, missing_fields).
- `days_until_expiry(expiry_date, current_date=None)` — signed integer days.
- `expiry_alert_status(days_until_expiry, lead_time_days=90)` — 'EXPIRED' / 'URGENT' /
  'ALERT' / 'OK'.
- `rollup_completion_counts(records, group_by)` — dict of group → {completed, incomplete, expired} counts.

IMPLEMENTED-FROM-DESCRIPTION per §0.5. Self-tests included; run
`python3 training_ops.py --test`.

NOT a Shared OS/logical/ script yet. Candidate second sources for graduation: an
employment-compliance textbook (Rothstein et al. *Employment Law* — same book as hire's
`worker_classification.py` candidate) + an LMS-administration institutional guide.

## Output Format

Each invocation produces one or more of:

- **Enrollment rules memo** — trigger conditions per training item + HRIS data-source
  confirmation + expected auto-enrolled cohort.
- **Audit-trail validation report** — per-record 4-field check + list of incomplete
  records + escalation for reconciliation.
- **Expiry alert report** — upcoming renewals in the 90-day / 30-day / EXPIRED bands +
  ownership assignment.
- **Compliance status rollup** — department / venture / role × completion status matrix
  + patterns flagged.
- **Access-control audit** — current access list to the audit-trail system + change
  recommendations routed to veil + operator.

## Principles

1. **One system of record.** Fragmented tracking is itself a compliance risk, not a
   neutral inconvenience. Consolidation is prerequisite to any other work.
2. **All 4 audit-trail fields (person / course-code / timestamp / attestation) are
   required, no exceptions.** Missing any one = record not compliant, do not count it.
3. **Compliance records stay individually identifiable BY LEGAL NECESSITY** — privacy
   protection is via access control (least-privilege IAM), NOT anonymization. **This
   inverts every other P&C skill's aggregate-only rule.** The inversion is deliberate
   and load-bearing.
4. **Retention periods are jurisdiction / regulation-specific.** Confirm with operator +
   employment counsel per Universal Principle 5; never assume a blanket default.
5. **Proactive expiry alerts (default 90-day lead time) beat reactive discovery every
   time.** Discovering a lapse via a regulator or partner asking for proof is the
   preventable failure this skill exists to fix.
6. **Audit-trail entries are tamper-proof.** No one edits or deletes existing entries.
   Corrections are appended as NEW entries only. Per Fallback rule 5.
7. **Escalate patterns, not just individual gaps.** A whole-team lapse indicates a
   systemic problem — individual escalations miss it.
8. **Access-control governance belongs with veil + operator**, not solely with grove.
   grove maintains records; veil governs who can see them.
9. **§0.6 flag.** The specific thresholds (90-day lead time; ~60-70% admin reduction from
   automation; 5-year OSHA retention example) are Tier B (canonical LMS / compliance
   vendor guidance cited; not book-cited from `Agents/_books/`). Downgrade to Tier A when
   Rothstein et al. + an institutional LMS-administration reference are placed per §8.0.

## Fallback

- **Audit-trail record missing one of the 4 required fields.** Flag immediately as
  INCOMPLETE / non-compliant. Do NOT count it as a completed compliance record until
  reconciled. Route to operator for the reconciliation.
- **Training tracked across multiple disconnected systems.** Recommend consolidating to a
  single source of truth BEFORE continuing any further analysis — fragmented tracking
  undermines everything downstream.
- **Retention period unclear for a specific regulation / jurisdiction.** Do NOT guess or
  apply a generic default. Route to operator + employment counsel to confirm.
- **Certification already expired with no renewal scheduled.** Escalate IMMEDIATELY as a
  live compliance gap. Do not wait for the next routine reporting cycle. Route to the
  person's manager + operator + (if regulatory exposure) employment counsel.
- **Request to edit or delete an existing audit-trail entry.** Decline. Corrections must
  be appended as NEW entries, never overwrites, to preserve audit-trail integrity per
  Principle 6. This is a hard refusal, not a discretionary one.
- **Request to consolidate access controls in a way that would BROADEN who can edit the
  audit trail.** Flag to veil + operator — the direction should always be tightening
  access, not loosening. Refuse the change until the broader-access rationale is
  documented and countersigned by veil + operator.
- **Pattern of lapses across a whole team.** Escalate the pattern to the manager AND to
  the operator per Principle 7 — don't log individual lapses silently and miss the
  systemic cause.
- **Individual-crisis signal surfaces** during a compliance conversation (rare but possible
  when a stalled certification traces to individual distress). Route per
  `wellbeing-monitoring` § Fallback rule 1 (manager + HR Ops + EAP) per Universal Principle
  3 — even inside grove's compliance-record-keeping scope, individual crisis is HARD
  BOUNDARY.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `training-program-design` (custom, grove — sibling) | The actual program / content being tracked; the "did it work?" evaluation | Bidirectional — content-side ships from training-program-design; logistics/records-side ships from here |
| `deliberate-practice` (custom, grove) | Mechanism-level design that produced the training being tracked | Upstream (via training-program-design) |
| `skill-gap-map` (custom, grove) | New hire's / role-change's identified gaps → enrollment triggers for the training that closes them | Upstream — skill-gap-map's Build actions eventually route through here for enrollment |
| `hiring-kit` (custom, hire) | New hire's compliance-training enrollment trigger (hire-date-based rule); accepted-offer post-classification per `payroll-and-eor` | Upstream — hiring-kit + payroll-and-eor's outputs enable enrollment automation |
| `payroll-and-eor` (custom, hire) | Worker classification determines which mandatory-training rules apply (contractors vs employees vs EOR staff often have different obligations) | Upstream |
| `workforce-planning` (custom, hire) | Structural moves (role change, department change, geographic move) trigger training enrollment re-evaluation | Upstream |
| Future Global Expansion department | Cross-jurisdiction retention rules; region-specific mandatory-training sets | Bidirectional when Global Expansion ships (task #3 in current build roster) |
| `veil` (Cybersecurity — data protection) | Access-control governance for the audit-trail system; PII handling in compliance records | Escalation — veil governs access; grove maintains records |
| `keyring` (Cybersecurity — IAM) | SSO / SCIM for the LMS platform; audit-trail-system authentication | Escalation |
| `board` (Governance — fiduciary-guard) | LMS / audit-trail-system budget approval; cost approval for compliance-training expansion | Escalation (placeholder until Finance agent exists) |
| Operator + employment counsel | Retention-period confirmation per regulation/jurisdiction; regulatory exposure escalation | Escalation |
| Manager + operator + EAP | Individual-crisis signal in a compliance conversation (Fallback last row); pattern-of-lapses escalation | Escalation |
| `wellbeing-monitoring` (custom, maslow) | Individual-crisis routing per HARD BOUNDARY escalation lane | One-way OUT (crisis only) |
| Future `merit` (P&C — Performance) | Individual perf evaluation is merit's scope, not grove's — even in compliance context | Aggregate boundary — no perf data crosses |
| `Shared OS: verification-before-completion` | Evidence gate on every audit-trail change, expiry alert, and compliance report | Cross-cutting |

## References (public / verifiable)

- [Automate Training Scheduling With an LMS — LMSPedia](https://lmspedia.org/automate-training-scheduling-lms/)
- [LMS Administrator Guide: Roles, Skills & Tools — ProProfs](https://www.proprofstraining.com/blog/lms-administrator/)
- [Corporate Compliance Training Audit Trail — Vigilearn](https://vigilearn.com/corporate-compliance-training-audit-trail/)
- [How to Build a Compliance Training Audit Trail — Coggno](https://coggno.com/blog/compliance-training-audit-trail-documentation/)
- [Compliance Audit Trail: Ensure Regulatory Adherence — HR Cloud](https://www.hrcloud.com/resources/glossary/compliance-audit-trail)
- [Compliance training reporting 101 — Absorb LMS](https://www.absorblms.com/resources/articles/compliance-training-reporting-101-what-it-is-and-why-it-matters)
- [Enterprise Compliance Training Tracking Systems — Coggno](https://coggno.com/blog/enterprise-compliance-training-tracking-systems/)
