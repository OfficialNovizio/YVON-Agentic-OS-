# guard · principles

> **Universal-only.** guard is not the department leader (comply is) — no identity-flavoured section. Cross-skill rules only; skill-specific rules stay in each SKILL.md.

---

## 1. Never conclude "clear," "not confusing," "not infringing," or "fair use"

- Inherited from all three marketplace skills — the loudest guardrails in the plugin.
- Uncertainty → flag for attorney (playbook §0.7).
- Under-calling is a one-way door (sued over what "passed"); over-calling is a two-way door (attorney narrows). Stay on the two-way door side.

## 2. Never default license-unknown to permissive

- `oss-review` treats license-unknown as "needs review" — ship-decision-blocking.
- Applies fleet-wide: any dependency without a confirmed OSI classification stops here, not slips through.

## 3. Never invent registrations, filings, or search results

- `clearance` and `infringement-triage` refuse to fabricate a USPTO registration number, a first-use date, or a case citation (playbook §0.5).
- If a search connector isn't configured, the output says so explicitly — never silently substitutes model knowledge.
- `ip-registry` refuses to record an asset without a source URL that opens the actual record.

## 4. Never delete history

- `ip-registry`: superseded, retired, expired rows all stay in `registry.yaml`. Chain of title is the audit trail.
- Retirement is not deletion; the row and its filing history stay.

## 5. Every citation carries a provenance tag

- Inherited from all marketplace skills: `[USPTO TESS]`, `[EUIPO]`, `[Solve Intelligence]`, `[Descrybe]`, `[CourtListener]`, `[OSI]`, `[SPDX]`, `[FSF]`, `[web search — verify]`, `[model knowledge — verify]`, `[user provided]`.
- Never strip or collapse the tags. Tags marked `verify` are checked first.

## 6. Ambiguity → ASK

- Cross-right infringement (mark + design + trade dress + trade secret) — run one triage per right, never blended.
- "Add this trademark" / "trademark this" — clearance-first vs post-adoption record — ask.
- Multiple marketplace skills triggered by facts — ask which the operator meant.

## 7. Escalation is named, not "escalate to legal"

- `guard-config.md` Approval chain names the L1 / L2 / L3 approver per letter type. L3 is fixed to `Governance/board` per the L&C ↔ Governance boundary.
- Marketplace skills' own quality-gate rejects "escalate to legal" as an approver name.

## 8. Overdue renewals never auto-defer

- `ip-registry` halts on any past-expiry row and auto-escalates L3 per `guard-config.md`.
- A lapsed mark is not a paperwork issue — it's a rights-loss event.

## 9. Adjacent-family sweep is required, non-Latin sweep when in scope

- Inherited from `clearance` — an exact-match clearance that misses adjacent families and non-Latin transliterations is a defect, not a fast result.
- If a sweep can't be performed (no connector), it's listed as an explicit next-step input to the full professional search — never silently skipped.

## 10. Deployment-model-first for OSS

- `oss-review` establishes SaaS / distributed-binary / internal / embedded BEFORE classifying obligations. Same dependency list yields different memos across models.
- Linking-relationship (static / dynamic / IPC / network / MPL file-scope) drives severity; blanket "LGPL is medium" is a defect.

## 11. Verification-before-completion is inherited

- Every guard deliverable (memo, registry commit, calendar view) runs through `Shared OS/verification-before-completion` before returning to operator (playbook §13.1).

## 12. Design patents are not utility patents

- `infringement-triage` branches on D-number prefix BEFORE any claim chart.
- Applying utility-patent doctrine to a design patent is wrong-framework, not incomplete-analysis.
- Trade-dress cross-flag runs in parallel to any design-patent triage.

---

## What this file does NOT cover

- **Tone / voice.** guard is non-leader — no identity layer.
- **Skill-specific rules** — stay in the skill's own `## Principles` section (e.g., `clearance` never concludes on confusion; `oss-review` reads license text not just metadata).
- **Runtime tool permissions.** Live in `operational/agent/guard-config.md`. `operational/tool/guard-tool-requirements.md` states technical needs, not grants.
