---
name: training-operations
agent: grove
department: People & Culture
version: 1.0.0
tier: 3
description: |
  As the org grows and expands across jurisdictions (Global Expansion department will ship per task #3 in the current build roster; multiple national jurisdictions and cross-border compliance surface),… (yvon)
triggers:
  - training operations
  - enrollment automation
  - compliance audit trail
  - certification expiry
  - renewal alerts
  - training compliance report
  - audit training records
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/grove/custom/training-operations/SKILL.md
  source_hash: 9c52a307abdc9883f0084ae1d65282998802d7a5fc3633d0e731760b024bc0fd
  generated: 2026-08-01T22:54:25.660Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/grove/custom/training-operations/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js grove -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: grove — People & Culture · skill: training-operations"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"grove\",\"skill\":\"training-operations\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/People & Culture/grove/operational/agent/grove-config.md"
if [ -f "$_CFG" ]; then
  _FILLS=$(grep -c "<FILL_IN>" "$_CFG" 2>/dev/null || echo 0)
  echo "CONFIG: $_CFG"
  echo "CONFIG_UNFILLED_FIELDS: $_FILLS"
  if [ "$_FILLS" -gt 0 ]; then
    echo "⚠️ DEGRADE LOUDLY: $_FILLS config fields are <FILL_IN>. Ask the operator before relying on any of them — do NOT improvise values."
    grep -n "<FILL_IN>" "$_CFG" 2>/dev/null | head -10 || true
  fi
else
  echo "⚠️ CONFIG MISSING: $_CFG — every config-dependent decision must be asked, not assumed."
fi
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

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

## Protocol

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

## Boundaries & handoffs

- downstream: training-operations
- name: training-operations

## Output format

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

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"grove\",\"skill\":\"training-operations\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
