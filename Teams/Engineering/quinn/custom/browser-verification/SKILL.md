---
name: browser-verification
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: browser-verification (VYON_Skills_Catalog_Full_v2.html, quinn/Engineering) — expanded per ENGINEERING-REDESIGN-PLAN §3/§5 into the two-gate design: Reticle gates edits, Playwright gates releases
marketplace_search: 2026-07-09 — Anthropic's official webapp-testing skill FOUND and imported verbatim to quinn/marketplace/webapp-testing (the Playwright machinery); this custom skill is the gate logic that decides what to verify and what passes. Reticle: github.com/reticlehq/reticle (MCP, proposed connector)
assigned_agent: quinn (Engineering / QA)
portable: true — gate logic is stack-agnostic; both tools are proposed connectors at deployment, and the skill degrades to a labeled manual checklist without them
includes: uses marketplace/webapp-testing (Playwright machinery); connectors per tool-requirements
date_added: 2026-07-09
---

## Introduction

browser-verification is quinn's evidence layer for the department's founding problem: **agents say "done"; browsers tell the truth.** Two gates, two tools. The **edit gate** (Reticle, MCP) verifies each frontend edit actually took effect — real state, real network calls, `file:line` traceability — catching mock data and half-wired UI at edit time. The **release gate** (Playwright, via the imported webapp-testing skill) runs the critical user flows in a real browser before anything ships — the E2E tier that test-strategy's matrix requires.

## Purpose

The Reticle-era lesson (dev's delivery-governance cites it too): an agent reports "feature complete" and the page is a shell of placeholder data and dead buttons. Static review can't catch this — the code *looks* wired. Only a browser executing the real app proves the claim. This skill makes browser evidence a gate requirement, not a nice-to-have: no evidence, no pass.

## When to Use

Triggers: "verify this edit," "did the change actually render," "run the browser checks," "E2E for release," "browser evidence," any mia/frontend diff at review time (edit gate), and every release with user-facing changes (release gate, via the matrix's E tier).

## Structure / Protocol

```
EDIT GATE (per frontend change — Reticle when connected)
  Frontend diff claims done
    -> Verify in the running app: element exists · state real (no mock/fixture leakage) ·
       expected network calls fire · change traces to file:line
      -> PASS: evidence attached to the review · FAIL: specific delta back to author
         (mock data rendering = dev's review-integrity block, escalated as such)

RELEASE GATE (per release — Playwright via marketplace/webapp-testing)
  Release candidate with user-facing changes
    -> Run critical flows (config: critical_flows) headless, real input, networkidle-awaited
      -> Screenshots + console/network logs captured as evidence
        -> All flows pass → E-tier evidence to test-strategy's gate verdict
        -> Any fail → GATE FAIL with flow · step · screenshot · console excerpt

Both gates run under the charter: browser tooling calls are plan-locked (Rail 1) and sandboxed,
egress-allowlisted (Rail 2) — a test run cannot exfiltrate.
```

## Instructions

1. **Evidence or it didn't happen.** A verification verdict carries artifacts: screenshots, console/network excerpts, `file:line` traces (edit gate). "I checked and it works" without artifacts is not a verdict — it's the exact claim this skill exists to distrust.
2. **Edit gate on every frontend diff.** Element rendered, real data bound (fixture/mock values leaking into the DOM = integrity block per dev's checklist §0), expected network calls fired, no new console errors. Route the evidence into the PR review.
3. **Release gate on the critical flows.** The `critical_flows` list is operator-set config (rule 0.5 — quinn doesn't decide what's business-critical). Run each flow with the webapp-testing machinery: real browser, headless, `networkidle` before inspection, assertions on outcomes not just page loads.
4. **Flaky browser tests follow the flaky rule.** A flow that passes on retry goes to the regression-map's flaky register — quarantined, counted, owned — never silently retried-until-green at the gate.
5. **Degrade loudly without connectors.** No Reticle → the edit gate is a labeled manual checklist (same checks, human-or-agent-executed, flagged "unverified by tooling"). No Playwright → the release gate's E tier is marked UNMET, and test-strategy's verdict says so; the gate does not quietly shrink.
6. **Charter compliance.** Browser runs are external tool calls: plan-locked, sandboxed, egress-allowlisted. Test data is synthetic — never production data in a test browser (Rail 2's spirit; production data handling belongs to dana under Rail 3 discipline).

## Output Format

```
## Browser Evidence: [change/release] — gate: EDIT / RELEASE
Checks run: [list] · Evidence: [screenshot/log/trace refs]
Mock-data leakage: [none / found → integrity block]
Flows: [flow · PASS/FAIL · artifact]

### Verdict: VERIFIED / FAILED (deltas named) / UNVERIFIED (tooling absent — labeled)
```

## Principles

- **Agents claim; browsers prove** — no browser evidence, no E-tier pass.
- **Verdicts carry artifacts** — screenshots and logs, not assurances.
- **Mock data in the DOM is an integrity block**, not a cosmetic note.
- **Degradation is loud** — a missing tool shrinks capability, never silently shrinks the gate.
- **Critical flows are operator-defined** — quinn enforces the list, doesn't author it (rule 0.5).
- **Test runs are charter-bound** — plan-locked, sandboxed, synthetic data only.

## Fallback

- Neither tool connected → both gates run as labeled manual checklists; every verdict carries the "unverified by tooling" flag; connector adoption surfaced to the operator (§5 of the redesign plan).
- App can't run headless / needs real devices → note the limitation, verify what's verifiable, flag the rest; mobile-specific verification is nova's domain when built.
- Flow fails only in CI, not locally → environment delta is itself a finding (candidate map entry), not a reason to pass.

## Boundaries with Other Skills

- **marketplace/webapp-testing** (imported, verbatim) is the Playwright machinery; this skill decides what to verify, when it gates, and what passes — improvements go here, never into the verbatim import.
- **test-strategy** (sibling) owns the gate verdict; this supplies the E-tier and edit-gate evidence feeding it.
- **regression-map** (sibling) receives flaky browser flows and environment-delta findings.
- **mia** (frontend, when built) is the primary producer of edit-gate work; the Agentation feedback loop planned for mia is upstream authoring context, not a substitute for this verification.
- **charter-enforcement** (sibling) locks and sandboxes the browser runs themselves.
