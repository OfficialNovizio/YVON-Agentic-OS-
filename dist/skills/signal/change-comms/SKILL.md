---
name: change-comms
agent: signal
department: Comms & PR
version: 1.0.0
tier: 3
description: |
  Prevents five failure modes that show up when major-change comms operate without distinct discipline: 1. (yvon)
triggers:
  - change comms
  - reorg announcement
  - reorganize the team
  - team restructure
  - layoff comms
  - layoff announcement
  - reduction in force
  - rif
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Comms & PR/signal/custom/change-comms/SKILL.md
  source_hash: a4cc38de305af7537414308699b39738393f93c7c6a39acd2284acdab5a04de4
  generated: 2026-08-05T18:27:41.743Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Comms & PR/signal/custom/change-comms/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js signal -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: signal — Comms & PR · skill: change-comms"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"signal\",\"skill\":\"change-comms\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Comms & PR/signal/operational/agent/signal-config.md"
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

- "Reorg announcement" / "reorganize the team" / "team restructure"
- "Layoff comms" / "layoff announcement" / "reduction in force" / "RIF"
- "Merger comms" / "acquisition comms" / "M&A announcement"
- "Major transition comms" / "org change"
- "Change management" (in an internal-comms context)
- "How do we announce this change" (when the change qualifies as major — vs routine
  decision broadcast which routes to `internal-cadence`)
- "Pre-change communications" / "post-change reinforcement"
- "Transition plan for [scope]"
- Handoff from hire's `workforce-planning` when a structural change is decided and
  needs comms discipline

Do NOT use for:

- **Routine decision broadcasts / weekly cadence / all-hands** → sibling
  `internal-cadence` skill.
- **Format templates** (3P / newsletter / FAQ / general) → sibling marketplace
  `internal-comms` skill.
- **External-facing change comms** (press coverage of the reorg, investor
  disclosure of the merger) → herald's `press-kit` + `media-relations` + beacon's
  `crisis-comms` + `investor-cadence` + operator + securities counsel.
- **Legal formalization of the change** (WARN Act notices, severance agreements,
  protected-class impact analysis) → operator + employment counsel per Universal
  Principle 5 legal fence. Comms discipline does NOT substitute for legal work.
- **Structural design of the change itself** (org chart, headcount decisions, reporting
  lines) → hire's `workforce-planning` + merit's `succession-planning`.
- **Individual mental-health signals during change conversations** → HARD BOUNDARY
  escalation per Universal Principle 3.

## Purpose

Prevents five failure modes that show up when major-change comms operate without
distinct discipline:

1. **Change-as-directive** — leadership announces the change without pre-comms narrative
   or post-comms reinforcement; team receives it as arbitrary. Kotter's 8-step model
   addresses this: step 1 is "create a sense of urgency" (pre-comms), step 8 is
   "anchor changes in corporate culture" (post-comms).
2. **Confused audience segmentation** — same layoff comms message goes to affected
   employees + retained employees + external partners + customers. Each audience needs
   distinct framing with distinct actionable content. Undifferentiated comms damages
   trust in multiple directions simultaneously.
3. **Bridges' Neutral Zone unmanaged** — announcement happens (Ending); new state
   arrives eventually (New Beginning); but the middle period (Neutral Zone — high
   uncertainty, low productivity, high anxiety) gets ignored. Bridges argues most
   change-management failures happen in the Neutral Zone, not at Ending or New Beginning.
4. **Legal-formalization confused with comms** — comms person drafts language that
   creates legal exposure (WARN Act violations, protected-class-adjacent phrasing,
   severance-negotiation-adjacent statements). Legal fence per Universal Principle 5 —
   employment counsel involved BEFORE any change comms ships.
5. **Individual mental-health signals during change conversations** — layoffs and major
   reorgs surface distress. HARD BOUNDARY escalation per Universal Principle 3 (inherited).

signal uses this skill whenever an internal event qualifies as major-change (reorg /
layoff / merger / major restructure) — distinct from the routine cadence that
`internal-cadence` (sibling) owns.

## Protocol

The change-comms workflow combines three frameworks:

```
KOTTER 8-STEP CHANGE MODEL (organizational-change process)
  1. Create a sense of urgency          (pre-comms narrative)
  2. Build a guiding coalition          (leadership alignment)
  3. Form a strategic vision            (what the new state looks like)
  4. Enlist a volunteer army            (early adopters + advocates)
  5. Enable action by removing barriers (unblock the transition)
  6. Generate short-term wins           (visible progress)
  7. Sustain acceleration               (build on wins)
  8. Institute change                   (anchor in culture)

BRIDGES TRANSITION MODEL (individual-psychological transition)
  Phase 1: ENDING          — letting go of the old (grief; loss; identity change)
  Phase 2: NEUTRAL ZONE    — the messy middle (uncertainty; ambiguity; low productivity)
  Phase 3: NEW BEGINNING   — embracing the new (energy; commitment; identity formation)

PROSCI ADKAR (individual-change milestones — sequential)
  A: AWARENESS      — of the need for change
  D: DESIRE         — to support the change (voluntary participation)
  K: KNOWLEDGE      — of how to change (skills + information)
  A: ABILITY        — to demonstrate new skills + behaviors
  R: REINFORCEMENT  — to sustain the change

CHANGE-COMMS SEQUENCE (this skill's operational workflow):
  1. Confirm scope + change type (reorg / layoff / merger / transition)
  2. Confirm legal-fence status  — employment counsel involved BEFORE comms ships
  3. Segment audiences           — affected / retained / customers / external
  4. Draft pre-change narrative  — Kotter step 1 + Sinek Start-With-Why + Bridges Ending
  5. Draft announcement          — audience-specific; honest WHY; explicit
                                   WHAT-CHANGES per audience
  6. Design Neutral Zone comms   — high-cadence updates during the messy middle
                                   (Bridges' most-often-neglected phase)
  7. Design reinforcement comms  — Kotter step 8 + ADKAR reinforcement; post-change
                                   institutional-anchoring
  8. Archive + close-the-loop    — per internal-cadence archive discipline
```

## Boundaries & handoffs

- **Legal fence BEFORE change-comms drafting** — operator + employment counsel involved.
- **signal does not draft change-comms without legal counsel involvement.**
- **signal does not skip Neutral Zone comms.** LOAD-BEARING per change-comms
- downstream: change-comms
- name: change-comms

## Output format

Each invocation produces one or more of:

- **Change-scope confirmation memo** — is this major-change requiring change-comms
  discipline, or routine decision routing to `internal-cadence`?
- **Legal-fence status check** — employment counsel involvement confirmed for the change
  type before drafting proceeds.
- **Audience segmentation plan** — per Phase 3.
- **Pre-change narrative brief** — Kotter step 1-3 (urgency + coalition + vision) where
  pre-comms is permitted.
- **Announcement drafts** (audience-specific) — WHAT / WHY / WHAT-CHANGES-FOR-YOU /
  TIMING / RESOURCES / NEXT COMMUNICATION.
- **Neutral Zone comms plan** — cadence + channels + named-point-of-contact per group +
  Q&A forum design.
- **Reinforcement plan** — Kotter step 8 + ADKAR reinforcement.
- **Post-change retrospective** — what worked + what didn't + lessons for next change.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"signal\",\"skill\":\"change-comms\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
