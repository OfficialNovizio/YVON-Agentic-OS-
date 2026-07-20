---
name: frontend-verification
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; plan §3 "Agentation feedback loop (MCP)" + the mia-side of quinn's edit gate
marketplace_search: 2026-07-09 — Agentation FOUND (agentation.com; MCP tool that turns UI annotations into structured, component-aware context for coding agents; two-way MCP sync; React component detection). Proposed connector per plan §5. Kept custom as the discipline that binds Agentation (authoring feedback) to quinn's Reticle/Playwright (gating) — they're complementary, not the same
assigned_agent: mia (Engineering / Frontend Web)
portable: true — the loop is framework-agnostic; Agentation + Reticle/Playwright are proposed connectors
includes: (no asset — uses quinn's browser-verification + the Agentation MCP)
date_added: 2026-07-09
---

## Introduction

frontend-verification is how mia proves the UI actually works, closing the loop the department was built to close ("agents say done; browsers tell the truth"). Two complementary tools: **Agentation** (MCP) turns human UI annotations — click an element, draw an area, freeze a state — into structured, component-aware context (CSS selectors, React tree, computed styles) so mia knows exactly what to change and where; and **quinn's browser-verification** (Reticle edit-gate, Playwright release-gate) proves the change rendered with real state and real data. Agentation is the input; quinn's gate is the proof.

## Purpose

Frontend is where "done" is most often false: the component that looks built but shows mock data, the button wired to nothing, the state that never updates. Agentation removes the ambiguity in *what to fix* (precise, component-aware feedback instead of "the thing is off"); quinn's browser-verification removes the doubt in *whether it's fixed* (real rendering, not a claim). Together they make frontend "done" mean done.

## When to Use

Triggers: "the UI is wrong/off," UI feedback to act on, "did this render," "verify the frontend," a frontend diff at review (edit gate), any user-facing release (release gate), and mock-data/placeholder suspicion.

## Structure / Protocol

```
FEEDBACK IN (Agentation MCP — when connected)
  Human annotates the running UI (click/area/state-freeze) → structured context:
  CSS selector · React component tree · computed styles · the ask
    -> mia acts on precise context, not a vague description → change with a known file:line target
      -> mia can acknowledge / resolve-with-summary / dismiss-with-reason (Agentation's two-way loop)

VERIFICATION OUT (quinn's browser-verification — the gate)
  EDIT GATE (Reticle): element exists · real state (NO mock/fixture data) · expected network calls fire · file:line traces
  RELEASE GATE (Playwright): critical user flows pass in a real browser
    -> PASS → gate evidence · FAIL → specific delta, not "looks off"
    -> Mock data rendering = integrity block (dev §0), escalated
```

## Instructions

1. **Agentation for precise input.** When UI feedback arrives, use Agentation's structured context (selector, component tree, computed styles) rather than guessing what "make it cleaner" means. The component-aware target means the change lands at the right `file:line` the first time — the antidote to the vague-feedback-vague-fix loop.
2. **Use the two-way loop honestly.** Acknowledge when starting, resolve with a real summary of what changed, or dismiss with a genuine reason — every state timestamped. Don't mark resolved what isn't (the Agentation-era version of "agents say done").
3. **quinn's edit gate on every frontend diff.** The change is verified in the running app: element renders, state is real (mock/fixture data in the DOM is an integrity block — dev §0), expected network calls fire, change traces to source. mia produces this evidence for review.
4. **quinn's release gate on user flows.** Critical flows pass in a real browser (Playwright) before release — the E-tier of quinn's matrix, for the surfaces mia owns.
5. **Degrade loudly without connectors.** No Agentation → feedback is handled from description, labeled less precise. No Reticle/Playwright → verification is a labeled manual checklist. The gate never silently shrinks (quinn's rule, inherited).
6. **Verification is charter-bound.** Browser runs are external tool calls: plan-locked (Rail 1), sandboxed, egress-allowlisted (Rail 2); test data is synthetic, never production.

## Output Format

```
## Frontend Verification: [change/release]
Feedback input: [Agentation context ref: selector/component/styles / description-only, labeled]
Edit gate (Reticle): [element ✓ · real data ✓ / mock found → integrity block · network ✓ · file:line]
Release gate (Playwright): [critical flows PASS/FAIL]
Loop state: [acknowledged/resolved-with-summary/dismissed-with-reason]
→ quinn gate evidence
```

## Principles

- **Agentation for precise input; quinn's gate for proof** — input vs verification, complementary not the same.
- **Component-aware feedback → right file:line first time** — no vague-fix loop.
- **The two-way loop is used honestly** — resolved means resolved, dismissed carries a reason.
- **Mock data in the DOM is an integrity block** — not a cosmetic note (dev §0).
- **Degrade loudly** — missing tools shrink capability, never silently shrink the gate.
- **Charter-bound runs** — plan-locked, sandboxed, synthetic data.

## Fallback

- No Agentation connector → act on written feedback, labeled less precise; recommend adoption (plan §5) via the operator.
- No Reticle/Playwright → manual verification checklist, labeled "unverified by tooling"; the release E-tier reports UNMET.
- Feedback ambiguous even with Agentation → ask for the specific annotation rather than guess; precise tooling deserves a precise ask.

## Boundaries with Other Skills

- **quinn/browser-verification**: OWNS the gates (Reticle edit, Playwright release); this skill produces the evidence and adds Agentation as the feedback-input side. mia doesn't re-implement quinn's gate; it feeds it.
- **ui-accessibility-standards / design-tokens** (siblings): what's verified — accessible, consistent, token-based UI with real data.
- **raj**: verification catches the frontend consuming raj's API wrong (mock data where a real call should be).
- **dev §0 integrity**: mock-data-rendering is the frontend instance of the agent-authored-code integrity block.
