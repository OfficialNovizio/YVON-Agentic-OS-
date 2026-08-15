<!--
Department README for Comms & PR. Companion to DEPARTMENT-WORKFLOW.md
(herald-led sequencing patterns).
-->

# Comms & PR

> The org's external + internal voice. Three agents, one leader, tightly-scoped
> split across press-side / internal / investor-side. Highest-density
> LOAD-BEARING-REFUSAL department in the fleet.

## Mission

Comms & PR owns the messages the org sends and the discipline behind them:

- **What we say publicly** (press pitches, press releases, holding statements,
  crisis-response, investor letters, material-info alerts)
- **What we say internally** (weekly cadence, decision broadcasts, all-hands,
  change comms)
- **How we back what we say** (data-room evidence, backing links from every
  investor claim to authoritative source, canonical library for press
  templates, Barcelona-Principles measurement for coverage)

Failure modes at this surface have legal (Reg FD, WARN Act, defamation,
securities-fraud, protected-class), credibility (corporate euphemism, silent
contradiction, forced newsjack, blast-pitch, AVE), and safety (distressed
spokesperson, individual-crisis during org-crisis) consequences that compound
faster than most surfaces. Structural refusals prevent these failure modes
under timing pressure or stakeholder insistence.

## Agents

| Agent | Role | Skills | Scripts | LOAD-BEARING REFUSALS | Identity |
|---|---|---|---|---|---|
| **herald** | Lead — PR & Media | 4 | 1 (`pr_analytics.ave_refuse()`) | 9 | David Meerman Scott (2020) |
| **signal** | Internal Communications | 3 | 0 | 9 | — (non-leader) |
| **beacon** | Investor Communications | 3 | 0 | 9 | — (non-leader) |
| **Department total** | | **10** | **1** | **27** | |

**Fleet position:** highest-density LOAD-BEARING-REFUSAL department in the
fleet. All 3 Comms & PR agents tied at 9 refusals each; total 27. P&C for
comparison: 7 refusals across 4 agents.

## Scope Splits (prevent scope creep)

- **herald** owns press-side: media-relations pitching + press-kit canonical
  library + media-training (3-messages-MAX + ABC bridging + hostile-Q drill)
  + pr-analytics (Barcelona-Principles; AVE refusal at code level via
  `ave_refuse()`).
- **signal** owns internal-side: internal-comms (Anthropic-official marketplace
  skill, verbatim per §4.8) + internal-cadence (weekly + all-hands + decision
  broadcasts, close-loop discipline, no-euphemism, no-silent-contradiction) +
  change-comms (Kotter + Bridges Neutral Zone + Prosci ADKAR, legal-fence for
  WARN Act + Reg FD + protected-class).
- **beacon** owns investor-side + crisis + DD: crisis-comms (Fink 5-stage +
  Coombs SCCT + Judy Smith + PRSA) + investor-cadence (Buffett + Larcker &
  Tayan + NIRI + Reg FD) + data-room-discipline (Feld & Mendelson + Berkus +
  NVCA + AICPA + SEC EDGAR).

## Out of Scope (routed elsewhere)

- **Pitch decks + fundraising materials + board decks** → **echo** (Executive
  Office)
- **Strategic vision + roadmap + venture-level narrative** → **marcus / vista**
  (Executive Office)
- **Structural design of reorg / headcount** → **hire** (P&C Lead) →
  `workforce-planning`
- **Legal formalization** of securities-law, NDA, M&A, employment-law,
  defamation → **operator + relevant counsel** (LOAD-BEARING legal fence)
- **Individual mental-health crisis signals** → **manager + HR Ops + EAP**
  (HARD BOUNDARY per Universal Principle 3)
- **Financial audit workpaper retention** (AICPA) → **CFO + external auditor**
- **PII data-protection compliance** → **warden + veil + bastion**
  (Cybersecurity)
- **Direct platform admin** (ATS admin, HRIS admin, data-room-platform admin,
  email-vendor admin, EDGAR filing submission) → **operator**

## Comms & PR-Specific Principles

Beyond Universal Principles 1-10, Comms & PR carries these department-level
disciplines:

1. **Barcelona Principles 3.0 measurement — AVE refusal at code level.**
   herald's `pr_analytics.ave_refuse()` raises `NotImplementedError` with
   Barcelona Principle 5 explanation. Inherited by signal + beacon at
   principle level. NO WORKAROUNDS.
2. **No corporate euphemism.** McCord discipline via herald identity + signal
   principles + beacon principles. Honest WHY. Never "headwinds" /
   "efficiency measures" / "personnel adjustments" / "challenging quarter" /
   "strategic realignment" during bad-news. Teams + investors + journalists
   smell euphemism; it erodes trust more than the underlying news.
3. **Single-designated-spokesperson.** Inherited from herald's `media-training`.
   ONE voice for entire crisis / investor call / high-stakes event. Deviation
   invites contradiction; contradictions amplify. HOLD if designated
   unavailable.
4. **No silent contradiction with prior artifact.** Long-tenured investors +
   journalists + employees track prior letters + press + all-hands. Explicit
   "Update from [prior artifact]: previously said X, now Y because Z" format
   required.
5. **Aggregate-only at publication surface.** Individual employee perf /
   demographic / feedback / medical / comp data NEVER surfaced through Comms &
   PR outputs. Inherited from P&C precedent.
6. **Individual crisis HARD BOUNDARY.** Universal Principle 3 applied across
   Comms & PR — elevated probability during high-stakes crisis / DD-crunch /
   change moments. Escalate to manager + HR Ops + EAP regardless of timing
   pressure.
7. **Reg FD legal fence** (beacon-owned; herald + signal coordinate). Material
   non-public information NEVER selectively disclosed to any investor subset
   without simultaneous public release. Non-negotiable.
8. **Stakeholder-sequencing rule.** Affected → investors → public. Never
   break the sequence except when regulatory timing forces simultaneous (Reg
   FD for public companies). Sequence-break by mistake or convenience is a
   §Principles violation.
9. **Close-loop discipline.** Every commitment in a Comms & PR artifact goes
   to a tracker; every subsequent artifact references close-loop. Silent
   drift = trust damage.

## Cross-Agent Coordination Surfaces

| Surface | Owner | Coordinators |
|---|---|---|
| Barcelona measurement + AVE refusal at code level | herald | Inherited by signal + beacon |
| Crisis-spokesperson prep (3-messages + ABC bridging + hostile-Q drill) | herald `media-training` | beacon `crisis-comms` Phase 5 downstream |
| Holding-statement templates from canonical library | herald `press-kit` | beacon `crisis-comms` Phase 2 downstream |
| Reporter outreach + correction requests | herald `media-relations` | beacon `crisis-comms` Phase 6 coordination |
| Internal announcements + stakeholder sequencing | signal `internal-cadence` | beacon (affected employees FIRST per crisis-comms Phase 4); herald (external release simultaneous per Reg FD when applicable) |
| Change-comms escalation to crisis (leaked / hostile / unexpected reaction) | signal `change-comms` | Routes to beacon `crisis-comms` |
| Reg FD material-info fence | beacon `investor-cadence` | signal + herald coordinate timing |
| Evidence-backing for investor claims | beacon `data-room-discipline` | echo coordinates for pitch-material consistency |

## Escalation Chain (department-level)

1. **In-skill Fallback section** on each agent's skills
2. **herald** (Comms & PR Lead) for department-level sequencing questions
3. **operator + relevant counsel** for legal-fence questions (securities /
   M&A / employment / defamation)
4. **board** (Governance) for governance-approval questions
5. **manager + HR Ops + EAP** for individual-crisis signals — HARD BOUNDARY

## File Layout

```
Teams/Comms & PR/
├── README.md                    (this file)
├── DEPARTMENT-WORKFLOW.md       (herald-led multi-agent sequencing)
├── herald/                      (Lead — PR & Media)
│   ├── agent.md
│   ├── identity/                (David Meerman Scott 2020)
│   ├── custom/                  (4 skills, 1 script)
│   └── operational/             (5 files)
├── signal/                      (Internal Comms)
│   ├── agent.md
│   ├── marketplace/             (internal-comms — Anthropic official verbatim)
│   ├── custom/                  (2 skills)
│   ├── operational/             (5 files)
│   └── logical/README.md
└── beacon/                      (Investor Comms)
    ├── agent.md
    ├── custom/                  (3 skills)
    ├── operational/             (5 files)
    └── logical/README.md
```

## Sources Depth Snapshot

**Currently Tier B across all 3 agents** — canonical sources cited but not
book-page-cited from `Agents/_books/`. Downgrade paths documented per agent:

- herald: Scott 2020 + Fournier + Yakabuski + Barcelona/AMEC placement pending
- signal: Kotter + Bridges + Prosci + Heath + Minto + Fournier + Udext +
  Gallup placement pending
- beacon: Fink 2013 + Coombs + Smith 2012 + Buffett letters + Larcker & Tayan
  2020 + Feld & Mendelson 2019 + Berkus + NVCA + AICPA placement pending

## Audit Notes

- **Department LIVE:** 2026-07-31 (all 3 agents complete).
- **Next audit trigger:** any new skill added; any framework citation change
  in an existing skill; any book placement in `Agents/_books/` that enables
  a Tier B → Tier A downgrade.
