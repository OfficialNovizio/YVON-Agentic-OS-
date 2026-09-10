## 1. Problem

The suite smoke follow-on needs to verify that `derivedFrom` is preserved on the pending record across the backend and connect path. Without this check, a smoke run could appear successful while losing the relationship needed to identify the derived result.

## 2. Evidence

- Operator directive in the discussion: “Backend + connect + e2e follow-on for the suite smoke design — proves derivedFrom rides the pending record.” Validation ladder L1.
- Operator decision via design gate: intent is **adapt**, with the requested change **smoke**.
- Operator decision via design gate: motion decision is **reference**, not code-generated motion.
- The recorded build recipe requires a video hero loop and section imagery, with both reference assets swapped before delivery.

## 3. Proposed Scope

- Add or update the backend smoke path so the pending record carries the expected `derivedFrom` value.
- Connect the pending record through the existing follow-on path without dropping or rewriting `derivedFrom`.
- Add an end-to-end smoke test covering creation, pending-record handling, connect processing, and observable preservation of `derivedFrom`.
- Use the recorded reference-build session as the fixture context:
  - Adapt intent with the requested smoke change.
  - Reference motion decision.
  - Swapped/licensed/AI/stock-equivalent assets as recorded by the swap gate.
- Keep the implementation limited to proving the data path; this is a throwaway smoke validation rather than a product feature.

## 4. Out of Scope

- General-purpose redesign of the pending-record or connect data model.
- Production migration, backfill, or compatibility work for existing records.
- New UI or user-facing controls for `derivedFrom`.
- Asset sourcing, licensing workflows, or visual redesign beyond honoring the recorded smoke fixture.
- Performance, load, analytics, or broad regression coverage outside this smoke path.
- Turning the throwaway smoke test into a maintained production workflow.

## 5. Success Metric

`derivedFrom` preservation pass rate for the defined smoke path; no versioned metric definition has been asked for, so success is currently a binary pass/fail outcome for the end-to-end case.

## 6. Acceptance Criteria

- Given the recorded smoke fixture, the backend creates a pending record whose observable data includes the expected `derivedFrom` value. **Falsifying case:** the pending record omits `derivedFrom`, contains a different value, or cannot be inspected.
- When the pending record passes through connect, the resulting observable record or response retains the same `derivedFrom` value. **Falsifying case:** connect removes, nulls, or changes the value.
- The end-to-end test fails when `derivedFrom` is absent at creation or after connect, rather than passing based only on overall request success. **Falsifying case:** the test passes while either checkpoint lacks the field or has the wrong value.
- The smoke fixture uses the recorded **adapt** intent and **reference** motion decision, including the recorded asset-swap state. **Falsifying case:** the fixture treats the work as clone, uses code-generated motion, or uses unswapped reference assets.
- The backend, connect, and end-to-end checks can be run by a stranger using the documented smoke test entry point and produce a clear pass/fail result for `derivedFrom` preservation. **Falsifying case:** a stranger must infer internal state or manually inspect implementation details to determine success.

## 7. Risks + Rollback Stance

- **Risk:** The existing pending-record or connect contract may not expose `derivedFrom` consistently. **Stance:** keep the change isolated to the smoke path and stop rather than broadening the data-model change without discovery.
- **Risk:** The throwaway fixture could accidentally encode production assumptions. **Stance:** do not promote it to production behavior or migrate existing data.
- **Risk:** The e2e test may pass for the wrong reason if it checks only request completion. **Stance:** require explicit assertions at both pending-record creation and post-connect checkpoints.
- **Rollback:** remove or disable the smoke fixture and its test changes; preserve existing backend and connect behavior unless the implementation is independently required. No production migration or irreversible data change is authorized.

## Working Agents

**Lead: raj** — backend/API implementation and connect-path ownership.  
**Supporting: quinn** — end-to-end and regression verification.

## Context Refs

- `store/design-sessions/`
- Reference-build session `e65c7cf0-bab6-4a42-b013-5cae319e787c`
- The session’s `design.md` and build `recipe`
- Recorded decisions: adapt intent, reference motion, and completed asset-swap gate

## 8. RICE

`[reasoning-based, not formula-verified]` — per backlog-rules rule 0.6, computed by the real `scripts/rice.py`, not hand-typed.

- reach: 1
- impact: 0.5
- confidence: 0.5
- effort: 1
- evidence_level: 1
- **score: 0.2**
