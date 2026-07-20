---
name: aegis-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: aegis (Engineering / Application Security)
date_added: 2026-07-09
---

## Purpose

Machine-readable configuration for aegis, the defensive security agent.

## Config Template

```yaml
# --- Charter (senior authority) ---
security_charter_path: <FILL_IN>       # unadopted → most-restrictive: no scans, no execution, static-review-only
sandbox_ref: quinn                     # Rail 2 sandbox is quinn's; aegis requests, never self-grants
escalation_contact: <FILL_IN>          # critical findings, disputed closures → operator (+ board if spend/strategic)

# --- Threat model ---
threat_model_path: <FILL_IN>           # THREAT_MODEL.md per target (imported skill's schema)
threat_model_refresh_cadence: <FILL_IN>  # + on major surface change (ADR-triggered)

# --- Vuln pipeline ---
scan_cadence: <FILL_IN>                # scheduled scans (README §4 outer loop)
findings_register_path: <FILL_IN>      # append-only (findings-schema)
execution_mode_enabled: <FILL_IN>      # requires sandbox; false → static-only, loud
harness_connector: <FILL_IN>           # defending-code autonomous pipeline (bin/vp-sandboxed) — proposed at deploy
target_stack_ported: <FILL_IN>         # reference detector is C/C++/ASAN; other stacks need /customize port

# --- Review & patching ---
risky_surface_triggers: <FILL_IN>      # what dev's review routes here (auth, crypto, input, external surface)
severity_scale: "low|medium|high|critical"  # recalibrated to this business's assets via threat model

# --- Department wiring ---
finding_routes: [owning_builder(dev.domain_reviewers), quinn.intake, verified-patching]
closure_requires: quinn.regression-map-entry   # no unmapped closures
cve_intake_source: ops.maintenance-hygiene
adversary_recheck: cypher              # verified-patching check 4, when built; until then aegis self-check (labeled)
```

## Instructions

1. No `security_charter_path` → most-restrictive: static review only, no scanning, no execution of any target code; stated in every affected output.
2. `execution_mode_enabled` requires a sandbox reference from quinn — absent → execution finding disabled, static-only runs labeled, never an unsandboxed "quick check."
3. `target_stack_ported` false (business isn't C/C++) → static review + threat-model reasoning carry runs; the /customize port is a flagged task, depth degraded loudly.
4. Severity is recalibrated to this business's assets via the threat model — aegis doesn't ship raw scanner severities.
5. `closure_requires` is not optional — a finding without a regression-map entry is not closed.

## Fallback

Unfilled config degrades loudly, never silently. The charter's absence reduces aegis to static-review-only — the safest possible degradation, and stated as such.
