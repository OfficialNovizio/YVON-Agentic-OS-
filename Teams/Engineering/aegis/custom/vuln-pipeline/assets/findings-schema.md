# Vulnerability Findings Schema — aegis/vuln-pipeline

> Adapted from the defending-code harness's VULN-FINDINGS.json / TRIAGE.json shape (credit: anthropics/defending-code-reference-harness), bound to this department's routing and threat model. One row per unique, verified finding.

## Findings table

| id | title | threat_id | location | class | severity | confidence | verified | status | owner | routed_to |
|---|---|---|---|---|---|---|---|---|---|---|

- `id`: `F1`, `F2`, … stable across triage passes.
- `title`: one line, names the concrete vulnerability (`dr_wav.h:412 unchecked chunk_size → heap overflow`).
- `threat_id`: the THREAT_MODEL.md threat this instantiates (`T1`). No matching threat → threat-model gap, flagged.
- `location`: `file:line` or component; the harness's precise-locus discipline.
- `class`: OWASP / CWE category (injection, authz, memory, SSRF, secrets, crypto, deserialization…).
- `severity`: recalibrated to THIS business's assets — `low|medium|high|critical` (threat-model impact × reachability).
- `confidence`: `static-only` | `execution-verified` (separate grader reproduced it).
- `verified`: reproduced-in-fresh-env? `yes|no`. `no` = candidate, not a finding — does not route downstream.
- `status`: `open | patching | patched-unverified | closed` (closed only via verified-patching + regression-map entry).
- `owner`: owning builder per dev's domain routing.
- `routed_to`: quinn intake ref · verified-patching ref · owner notification.

## Dropped (audit trail — false positives and out-of-scope)

| candidate | reason |
|---|---|
| | test/fixture code · unreachable · duplicate of F# · unverified after N attempts · risk-accepted by owner |

## Provenance
- scoped_by: [THREAT_MODEL.md path @ ref]
- mode: static | execution(sandboxed)
- date: YYYY-MM-DD
- source: pipeline scan | dev risky-diff referral | ops CVE handoff [CVE id]
