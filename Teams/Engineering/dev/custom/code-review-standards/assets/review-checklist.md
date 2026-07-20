# Code Review Checklist — dev/code-review-standards

> Run in order. Scope = this diff only. Stack-specific lint rules come from the stack-profile; these are universal.

## 0. Integrity — agent-authored code (blocking, before all else)
- [ ] Every API/method/endpoint/param called actually exists (verified against the real dependency, not the diff's claim)
- [ ] No mock, placeholder, or fixture data presented as wired-up (hardcoded values, example.com, lorem)
- [ ] No test weakened, skipped, or deleted to make a gate pass (automatic block pending written justification)
- [ ] No TODO / NotImplemented / empty handler behind a "done" or "feature complete" claim
- [ ] Diff touches only files the stated task requires (over-broad diff = finding; Rail 1-adjacent signal)

## 1. Correctness (load-bearing)
- [ ] Does the change do what the PR claims?
- [ ] Happy path traced; error paths traced
- [ ] Edge cases the tests don't cover (empty, null, huge, concurrent, malformed)
- [ ] No breaking change to a public contract without a migration/version bump
- [ ] Idempotency / retries where the operation can be repeated

## 2. Security (load-bearing)
- [ ] All external input validated / sanitized at the boundary
- [ ] Authorization checked on every new path (not just authentication)
- [ ] No secrets, keys, or tokens in code or logs
- [ ] Injection surfaces (SQL, command, template, SSRF, XSS) addressed
- [ ] New external surface / auth change → **routed to aegis before approval**

## 3. Tests
- [ ] Non-trivial logic carries tests
- [ ] Tests assert behavior, not just execute
- [ ] quinn's required tiers for this change type are present
- [ ] Fragile-area diffs (quinn's regression map) carry targeted regression

## 4. Style
- [ ] stack-profile conventions followed
- [ ] Names say what things are; no dead code
- [ ] Readable by the next person, not just the author

## Charter gate (blocking)
- [ ] Any new external-tool call will be **plan-locked** (Rail 1)
- [ ] Any data mutation routes to an **operator-run script** — no agent-executed destructive DB op (Rail 3)
- [ ] Any sandbox-escaping tool use is denied (Rail 2)

**Verdict:** APPROVE / REQUEST CHANGES (each item: `file:line · problem · fix`)
