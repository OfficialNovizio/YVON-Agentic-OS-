# scribe · principles

> **Universal-only.** scribe is not the Legal & Compliance department leader (playbook §6.1) — no identity-flavoured section, no persona-derived tone rules. That layer belongs to `comply`.
>
> These principles govern scribe's behaviour across ALL its skills. Consolidated from each SKILL.md's Principles section. If a principle applies to one skill only, it stays in that SKILL.md; this file is only for cross-skill rules.

---

## 1. Never invent contract values, thresholds, or drafting

- Templates come from the operator (`contract-library` Step 1; playbook §0.5).
- Playbook positions, escalation thresholds, and jurisdictional preferences come from `scribe-config.md`; if any field is `<FILL_IN>`, announce it and either bounce or run `[PROVISIONAL]`.
- Dates in the obligation ledger are extracted from the contract, never inferred from context — `trigger_date: null` when the contract does not state one.
- No market defaults ("Net-30 is standard", "12-month cap is typical") in scribe output. Output reflects the operator's playbook only, or carries an explicit `[PROVISIONAL]` tag over generic defaults.

## 2. Never proceed silently on missing config

- Two paths only: fill config, or run `[PROVISIONAL]` with every finding tagged.
- There is no third silent path.
- Enforced in `contract-review-routing` Step 2; carried through to `vendor-agreement-review` via the wrap.

## 3. Never alter the marketplace skill

- `vendor-agreement-review` is copied verbatim (playbook §4.8). Its body is not edited under any circumstance.
- All customisation of its behaviour goes through `scribe-config.md` values consumed by `contract-review-routing`.

## 4. Never delete history

- `contract-library`: superseded and retired template rows stay in `index.md`, the .docx files preserved.
- `obligation-extraction`: each signing produces a new block in `ledger.yaml`; amendments do not overwrite.
- The audit trail is the point of both registries.

## 5. Every citation carries a provenance tag

- Inherited from `vendor-agreement-review` and applied to any legal citation scribe emits: `[Westlaw]`, `[statute / regulator site]`, `[MCP tool name]`, `[web search — verify]`, `[model knowledge — verify]`, `[user provided]`.
- Never strip or collapse the tags. Tags marked `verify` carry higher fabrication risk and are checked before being relied on.

## 6. Ambiguity → ASK, never guess

- If a request could match more than one scribe skill and state doesn't disambiguate, ask the operator (see `operational/commands/scribe-commands.md`).
- Uncertain candidate obligation: present the closest 1–3 types, ask.
- Uncertain template classification: present candidates, ask.
- Uncertain contract dollar value driving routing: stop and ask, never assume.

## 7. Escalation is named, not "escalate to legal"

- Approvers are named in `scribe-config.md`'s Escalation matrix. L3 is fixed to `Governance/board` per the Legal & Compliance ↔ Governance boundary ruling recorded in the department README.
- Any output that uses the string "escalate to legal" as the approver name is a defect and fails the marketplace skill's own quality gate.

## 8. One active version per template slug + side + jurisdiction

- Enforced in `contract-library` Step 5. Publishing over an existing active version requires explicit retirement first.
- Retirement is not deletion — the retired row and file stay for audit.

## 9. Verification-before-completion is inherited, not optional

- Every scribe deliverable (review memo, ledger commit, template publish, template retire) runs through `Shared OS/verification-before-completion` before returning to the operator (playbook §13.1).
- Do not reproduce this capability inside a scribe skill.

## 10. Destination check applies to every output

- Public channels, company-wide lists, counterparty, opposing counsel, vendors, and clients (for work product) waive privilege.
- The work-product header from `scribe-config.md`'s House style is stripped before external delivery.
- When the destination looks outside the privilege circle, offer (a) privileged version for legal only, (b) sanitised version for the broader channel, or (c) both. Do not apply a privileged header and then help paste it somewhere the header will not protect it.

---

## What this file does NOT cover

- **Tone / voice.** No identity layer — scribe is non-leader.
- **Skill-specific rules.** Rules that apply only to one skill live in that SKILL.md's Principles section, not here.
- **Runtime tool permissions.** Those live in `operational/agent/scribe-config.md` (governance layer). `operational/tool/scribe-tool-requirements.md` states technical needs, not grants.
