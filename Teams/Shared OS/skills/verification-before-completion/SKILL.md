---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing, releasing, or handing off any deliverable — requires running verification and confirming output before making any success claims; evidence before assertions always
provenance:
  source: marketplace — obra/superpowers (github.com/obra/superpowers, skills/verification-before-completion)
  adopted: 2026-07-10
  adaptations: generalized beyond code (VYON agents also produce documents, decisions, designs); removed source-repo-personal references ("24 failure memories", "your human partner"); added VYON scope + quinn enforcement note. Method unchanged.
layer: shared-os (applies to EVERY agent in EVERY department — do not copy into individual agent folders)
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification (command, checklist, or re-read) for a claim in this working session, you cannot make that claim.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What check proves this claim?
2. RUN: Execute the FULL check (fresh, complete)
3. READ: Full output — exit codes, failure counts, actual content
4. VERIFY: Does the output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test of original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Sub-agent completed | Diff/artifact inspected | Agent reports "success" |
| Requirements met | Line-by-line checklist against the brief | Tests passing |
| Document/deliverable done | Re-read against the request, gaps listed | "Looks finished" |

## Red Flags — STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!")
- About to commit / release / hand off without verification
- Trusting a sub-agent's success report
- Relying on partial verification
- Thinking "just this once"
- Wanting the work to be over
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter ≠ compiler |
| "Agent said success" | Verify independently |
| "Partial check is enough" | Partial proves nothing |
| "Different words so rule doesn't apply" | Spirit over letter |

## Key Patterns

**Tests:** ✅ [Run tests] [See: 34/34 pass] "All tests pass" · ❌ "Should pass now"

**Regression tests (red-green):** ✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass) · ❌ "I've written a regression test" without the cycle

**Build:** ✅ [Run build] [exit 0] "Build passes" · ❌ "Linter passed"

**Requirements:** ✅ Re-read brief → checklist → verify each → report gaps or completion · ❌ "Tests pass, phase complete"

**Delegation:** ✅ Sub-agent reports success → inspect the diff/artifact → report actual state · ❌ Trust the report

## When To Apply

**ALWAYS before:** any success/completion claim or paraphrase of one, any expression of satisfaction, committing/releasing, marking a task done, moving to the next task, delegating onward, or handing a deliverable to another agent or the operator.

## VYON scope & enforcement

- **Every agent, every department, every deliverable type** — code, documents, decisions, designs, analyses. A decision claimed "formula-verified" requires the formula actually run (playbook rule 0.6); a document claimed "done" requires re-reading it against the brief.
- **Engineering:** quinn is the enforcement point — its release gate rejects any "done" that arrives without fresh evidence (see quinn/custom/test-strategy and charter-enforcement).
- This skill lives in the Shared OS layer only. Agents reference it; they never copy it.

## The Bottom Line

Run the check. Read the output. THEN claim the result. Non-negotiable.
