---
name: internal-cadence
agent: signal
department: Comms & PR
version: 1.0.0
tier: 3
description: |
  Prevents four failure modes that show up when internal comms operate without cadence discipline: 1. (yvon)
triggers:
  - internal cadence
  - announce internally
  - team update
  - decision broadcast
  - how do i explain this decision to the team
  - match message to channel
  - which channel for this message
  - all-hands doc
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Comms & PR/signal/custom/internal-cadence/SKILL.md
  source_hash: eaf1160edf263cb1f4ad2d9209ba5883f56ef3cb511b104f77025d938053173c
  generated: 2026-08-05T18:27:41.755Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Comms & PR/signal/custom/internal-cadence/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js signal -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: signal — Comms & PR · skill: internal-cadence"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"signal\",\"skill\":\"internal-cadence\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Announce internally" / "team update" / "internal announcement for [scope]"
- "Decision broadcast" / "how do I explain this decision to the team"
- "Match message to channel" / "which channel for this message"
- "All-hands doc" / "prepare for all-hands"
- "Weekly leadership notes" / "leadership sync notes"
- "Archive this comms" / "add to the archive"
- "Internal cadence for [scope]" / "set up internal-comms rhythm"
- Handoff from marketplace `internal-comms` when a format is drafted and needs channel /
  cadence / archive routing

Do NOT use for:

- **Format-drafting itself** (3P / newsletter / FAQ / general comms) → marketplace
  `internal-comms` (Anthropic official, in signal's marketplace/).
- **Change-management comms** (reorg / layoff / major transition) → `change-comms`
  (custom, signal — sibling). Change-comms has distinct discipline (Kotter + Bridges +
  Prosci ADKAR) beyond routine cadence.
- **External-facing comms** → herald's `media-relations` + `press-kit`.
- **Investor-facing comms** → beacon's `investor-cadence`.
- **Individual mental-health signals** → HARD BOUNDARY escalation to manager + HR Ops +
  EAP per Universal Principle 3 (inherited).
- **Crisis comms** (correction / retraction / hostile press) → beacon's `crisis-comms`.

## Purpose

Prevents four failure modes that show up when internal comms operate without cadence
discipline:

1. **Format-without-cadence** — one-off announcements produce information overload;
   predictable cadence lets people know WHEN to look for updates and reduces the
   "did-I-miss-something" anxiety that erodes internal-trust.
2. **Wrong-channel drift** — the same message sent to the wrong channel loses signal.
   An urgent decision buried in a Friday-afternoon email; a routine team update dropped
   into #announce; a strategic pivot mentioned only in a manager 1:1 that never
   cascades. The channel-cadence matrix (Phase 1) fixes this.
3. **Decision broadcasts without WHAT / WHY / WHAT-CHANGES** — teams get told "we
   changed X" without knowing why or how it affects their work. Reads as arbitrary;
   damages trust in leadership. The 3-part decision-broadcast structure (Phase 3) fixes
   this.
4. **Un-archived comms** — decisions and announcements get buried in scrolling channels;
   future team members can't find context; institutional memory decays. Searchable-archive
   discipline (Phase 5) fixes this.

signal uses this skill as the operational entry point for every internal announcement
that requires cadence discipline (not one-off casual chat).

## Protocol

The internal-cadence workflow:

```
1. CHANNEL-CADENCE MATRIX (owned + maintained here)
    Match message TYPE + URGENCY + SCOPE to CHANNEL + CADENCE:
      Company-wide urgent   → Slack #announce + email backup (same-day)
      Company-wide routine  → Weekly newsletter (uses internal-comms newsletter format)
      Team-weekly           → 3P update (uses internal-comms 3P format) via team channel
      Monthly all-hands     → Prepared doc + live meeting + Q&A + async recording/summary
      Decisions             → Decision broadcast (this skill's format, Phase 3)
      Casual / operational  → Team-channel chat (no cadence overhead needed)
      FAQ                   → Weekly FAQ digest (uses internal-comms FAQ format)

2. FORMAT ROUTING
    If the message maps to a marketplace-internal-comms format (3P / newsletter / FAQ /
    general), route the DRAFTING to that skill; this skill handles the CHANNEL + CADENCE
    + ARCHIVE routing.

3. DECISION-BROADCAST STRUCTURE (this skill's specific format)
    Every decision announcement has 3 required sections:
      WHAT changed        — the concrete change (1-2 sentences)
      WHY it changed      — the business or team rationale (2-3 sentences; honest)
      WHAT this changes   — for whom, in what specific ways (per-audience if needed)
                            for [group A]: [specific implication]
                            for [group B]: [specific implication]

    Optional 4th section:
      Q&A anticipated     — top 3-5 questions with prepared answers
                            (feeds forward to next FAQ digest)

4. ALL-HANDS PREPARATION
    Every monthly all-hands has 4 artifacts:
      a. Prepared doc      — pre-shared 24-48 hours in advance
      b. Live meeting      — 60-90 minutes typical; time-boxed sections
      c. Q&A               — live + async (submitted questions before the meeting;
                             prioritized during the meeting)
      d. Async version     — recording + summary posted to searchable archive
                             within 24 hours of the live meeting

5. SEARCHABLE ARCHIVE (single source of truth)
    All decision broadcasts, all-hands materials, newsletters, and structured FAQ
    digests → searchable archive location (typically a company wiki / Notion /
    Confluence with search enabled + tags per topic + dates).
    Rules:
      - Every entry has a permanent link that survives channel-scrolling.
      - Every entry tagged: topic + affected-audience + date + author.
      - Prior entries linked from new entries when the topic connects.
      - Contradictions between entries: NEVER silent — address the contradiction
        explicitly ("update from [prior entry]: previously said X, now Y because Z").

6. CLOSE-THE-LOOP DISCIPLINE (inherited from maslow's pulse-survey pattern)
    Every cycle: before the next weekly leadership notes / monthly all-hands, communicate
    at least one visible action taken from the previous cycle's feedback / Q&A.
    Skipping this erodes trust; team stops sending questions / feedback because they
    don't feel heard.
```

## Boundaries & handoffs

- **Channel-cadence matrix BEFORE format drafting** — internal-cadence Phase 1.
- **Never silent contradiction with prior archive entry** — internal-cadence Principle 6.
- upstream: internal-cadence
- name: internal-cadence
- downstream: internal-cadence

## Output format

Each invocation produces one or more of:

- **Channel-cadence recommendation** — matrix lookup result for a specific announcement
  scope + urgency + type.
- **Decision broadcast** — WHAT / WHY / WHAT-CHANGES structure with per-audience impact
  if applicable, plus optional Q&A anticipated.
- **All-hands preparation kit** — prepared doc + agenda + presenter briefs + Q&A
  submission form + archive plan.
- **Weekly leadership notes template** — cadence-consistent format for weekly leadership
  sync notes.
- **Searchable archive entry** — canonical archive form with tags + cross-references.
- **Close-the-loop memo** — visible-action-from-previous-cycle brief.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"signal\",\"skill\":\"internal-cadence\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
