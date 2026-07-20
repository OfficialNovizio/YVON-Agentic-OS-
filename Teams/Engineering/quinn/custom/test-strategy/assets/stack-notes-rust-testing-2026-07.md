# Stack Notes — Rust Testing (dated 2026-07)

**Applies only when the business's stack-profile names Rust.** Method authority: `test-strategy` (tiers, floors, gate — conflicts resolve there). Source: affaan-m/everything-claude-code `rust-testing`, adopted 2026-07-10, condensed. Verify tool versions if >6 months old.

## TDD cycle
RED (test first, `todo!()` placeholder) → GREEN (minimal pass) → REFACTOR (tests stay green). Matches the Shared OS red-green regression rule.

## Test tiers → Rust mechanics (test-strategy's pyramid mapped)
- **Unit:** `#[cfg(test)] mod tests` in-module; `assert_eq!` over `assert!` (better failures); float compares via `EPSILON`.
- **Integration:** `tests/` dir — each file its own binary; shared utilities in `tests/common/mod.rs`.
- **Doc tests:** examples in `///` docs are executable — API docs that can't rot; `no_run` for network/setup-dependent examples.
- **Property-based:** `proptest` for invariants (roundtrips, length-preservation, ordering) + custom strategies for domain values (e.g. valid-email generator).
- **Parameterized:** `rstest` cases + fixtures.
- **Async:** `#[tokio::test]`; timeouts via `tokio::time::timeout`; **never `sleep()`** — channels/barriers/`tokio::time::pause()`.

## Error/panic testing
Prefer asserting `Result::is_err()` + `matches!(err, Variant(_))` over `#[should_panic]`; tests returning `Result` use `?` for clean failures.

## Mocking
`mockall` `#[automock]` on traits; expectations with `.with(eq(..))`, `.times(n)`, `.returning(..)`. Don't mock everything — prefer integration tests when feasible.

## Coverage (feeds test-strategy's operator-set floors)
`cargo llvm-cov` (`--html`, `--lcov`, `--fail-under-lines 80`). Source targets: critical logic 100% · public API 90%+ · general 80%+ · generated/FFI excluded. **Actual floors are operator-set in quinn-config — these are the source's defaults, not VYON law.**

## Commands
`cargo test` · `-- --nocapture` · `--lib` / `--test <name>` / `--doc` · `--no-fail-fast` · `-- --ignored`. Benchmarks: criterion (`harness = false`, `black_box`).

## CI shape
fmt --check → clippy `-D warnings` → test → llvm-cov with floor. Pipeline itself is ops's domain; the gate verdict stays quinn's.

## Flaky tests
Fix or quarantine — never ignore (test-strategy's quarantined-and-counted rule applies unchanged).
