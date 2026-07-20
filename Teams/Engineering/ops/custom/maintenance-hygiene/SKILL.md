---
name: maintenance-hygiene
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none in catalog ("maintain without breaking" had no owner — plan §1) — new, per plan §3
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — devops category skills found are deploy/pipeline-centric; the standing-hygiene register (deps, backups, baselines, expiries) didn't exist as a skill; kept custom
assigned_agent: ops (Engineering / DevOps & Reliability)
portable: true — the hygiene categories are universal; cadences, tools, and thresholds are config/playbook
includes: assets/maintenance-register-template.md
date_added: 2026-07-09
---

## Introduction

maintenance-hygiene is the standing care that keeps a healthy system healthy: dependency and patch cadence, **restore-tested backups** (a backup that has never been restored is a rumor), monitoring baselines (the "normal" every deploy and incident is judged against), and the expiry register (certs, tokens, domains, quotas — the things that break on a schedule nobody watches). It is the anti-entropy skill: unglamorous, scheduled, and the reason there's less for incident-response to do.

## Purpose

Systems don't only break when changed — they rot in place. Dependencies accrue CVEs, backups silently stop working, certs expire on a Sunday, "normal" drifts until nobody knows what healthy looks like. Every one of those is a fully preventable incident. Hygiene converts them from surprises into calendar entries.

## When to Use

Triggers: "maintenance," "update dependencies," "are backups working," "what's our baseline," "cert expiry," "patch this CVE," scheduled cadence runs (config), post-incident baseline updates, and quinn/dev asking "what does normal look like" during verification.

## Structure / Protocol

```
THE REGISTER (assets/maintenance-register-template.md — one document, four sections)

1 DEPENDENCIES & PATCHES
  cadence per config → inventory drift vs stack-profile → security patches by CVE severity
  → every update ships through the NORMAL pipeline: quinn's gate + release-discipline
    (a dependency bump is a deploy, not an exception)

2 BACKUPS — restore-tested or nonexistent
  what's backed up · schedule · retention (all config)
  → RESTORE TEST on cadence: actually restore to a scratch environment, verify integrity
  → restores of real data stay read-shaped; anything destructive-in-production = Rail 3, operator

3 MONITORING BASELINES
  error rate · latency · saturation · cost per service — "normal" recorded with a date
  → alerts thresholded off baselines (thresholds = config; ops proposes, operator adopts)
  → baselines re-dated after material changes; stale baselines are findings

4 EXPIRY REGISTER
  certs · tokens · API keys · domains · quotas · vendor renewals — each with expiry date,
  renewal owner, and an alert lead time (config) → renewal is a scheduled task, not a surprise
```

## Instructions

1. **Work the cadence, not the mood.** Each section runs on its configured schedule (`maintenance_cadences`); a skipped run is logged as skipped — silent skips are how rot compounds. Findings are dated entries in the register.
2. **Dependency updates are deploys.** Patch-level security updates ride the hotfix row when a CVE demands speed; everything else batches on cadence — but all of it passes quinn's gate and release-discipline's checklist. No "it's just a dep bump" bypass; lockfile drift vs the stack-profile is a finding (dev's rule).
3. **A backup is proven by a restore.** On cadence: restore the backup to a scratch environment, verify integrity (counts, checksums, app boots against it), record the evidence and the measured restore time (that number is the real recovery floor during incidents). A failed restore test is a P2 incident, not a register note.
4. **Baselines are dated facts.** "Normal" = measured numbers with a measurement date, not folklore. Deploy verification (release-discipline) and incident "resolved" both reference them, so stale baselines corrupt two other skills — re-baseline after material changes and on cadence.
5. **Nothing expires unwatched.** Every cert, token, key, domain, and quota lives in the expiry register with an owner and an alert lead time. The Sunday-night cert expiry is the most preventable incident class that exists.
6. **Propose, don't invent, thresholds.** Alert thresholds, retention windows, and cadences are operator-adopted config (rule 0.5). ops recommends values with reasoning (labeled reasoning-based per rule 0.6 until the logical layer grounds them) — it never silently enforces its own guesses.

## Output Format

```
## Hygiene Run: [section] — [date] (cadence: [met/late])
Findings: [dated entries — CVE/drift/failed-restore/stale-baseline/upcoming-expiry]
Actions: [batched update → gate/deploy refs · restore evidence + duration · re-baseline + date · renewals scheduled]
Escalations: [failed restore test → P2 · unpatched critical CVE past window → operator]
```

## Principles

- **Restore-tested or nonexistent** — the backup you haven't restored is the one that fails.
- **Hygiene ships through the same gates as features** — no maintenance bypass around quinn or the checklist.
- **Baselines are dated measurements, not memories** — two other skills depend on them being true.
- **Expiries are calendar entries, not surprises** — owner + lead time for every dated credential.
- **Skipped runs are logged skips** — visible debt, never silence.
- **Thresholds are operator-adopted; ops proposes with labeled reasoning** (rules 0.5/0.6).

## Fallback

- No monitoring connector bound → baselines from whatever is measurable (logs, synthetic checks via quinn's browser machinery), loudly labeled partial; connector adoption surfaced to the operator (plan §5: Datadog candidate).
- No backup infrastructure exists → this is finding #1, severity high, proposed to the operator before any other hygiene work — everything else assumes recoverability.
- Cadences unset → run once to establish the register's initial state, propose cadences from what was found (labeled reasoning-based), and schedule nothing silently.

## Boundaries with Other Skills

- **release-discipline** (sibling) consumes the baselines at deploy verification and ships hygiene's updates; the measured restore time feeds its rollback reality.
- **incident-response** (sibling) escalates failed restore tests (P2) and unwatched-expiry incidents; post-mortems send baseline/alert gaps here.
- **platform-playbooks** (sibling) holds the tool-specific mechanics (which backup service, which monitoring product, per stack-profile).
- **quinn**: hygiene changes pass the same gate; the flaky/coverage registers are quinn's — this register is infrastructure-side, deliberately parallel in discipline.
- **dev/stack-profile**: the dependency inventory's source of truth; drift found here is dev's finding to rule on.
- **aegis** (when built): CVE triage above patch-level severity becomes joint work; until then, most-restrictive reading + operator escalation.
