# loom — Tool Requirements

**This file specifies needs; it does not grant them.** Access is configured at deployment (operator/platform; Fleet Charter Rails 1–2 apply — registered tools only, least privilege).

| Skill | Needs | Why |
|---|---|---|
| assumption-mapping | file read (PRDs, opportunities, PMF plans); file write (own maps) | riskiest-first triage |
| experiment-discipline | experiment platform / A-B tooling (if configured); handoff to metric (verify-live) + Engineering (build test); file write (experiment cards) | run falsifiable tests |
| experiment-registry | file read/write (own append-only registry) | the re-run guard + history |
| pmf-scorecard | file read (metric retention curves, ux findings); survey tooling (Ellis); file write (scorecards) | triangulated PMF read |

loom designs and reads experiments; metric owns the numbers and instrument verification; Engineering builds/gates any test surface; loom writes only its own maps, cards, registry, and scorecards. Revenue experiments (via price) carry extra blast-radius rules.
