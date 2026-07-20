# Ruling Record Schema — precedent/ruling-log

> One record per board ruling, appended to the configured decision log. Append-only:
> corrections are new records referencing the original `ruling_id`.

```yaml
ruling_id: <R-YYYY-NNN>              # sequential per year
date: <YYYY-MM-DD>
case: <the decision under review, one line>
scope: <venture/unit, or "company">
gates_run: [constitution-enforcement, strategic-veto, fiduciary-guard,
            pre-mortem, risk-assessment-matrix]   # whichever applied
rulings:
  - gate: <skill name>
    ruling: <PASS | VIOLATION | VETO | NO CONFLICT | TENSION | APPROVE |
             CONDITIONAL | REJECT | PASS_WITH_MITIGATIONS | HOLD | UNCLEAR>
    cited: "<article/commitment/threshold quoted verbatim, with ID>"
    rationale: "<the because — never reconstructed after the fact>"
operator_final_call: <same as board | overruled — with the operator's stated reason>
tags:
  articles: [<A1, C2, ...>]          # constitution articles / commitment IDs cited
  topics: [<spend | hiring | partnership | venture-launch | ...>]  # 1–3, reuse before minting
outcome: <filled in later if known — what actually happened; date>
corrects: <ruling_id, if this record corrects a prior one; else omit>
```

## Field notes

- **rationale** is mandatory per ruling. "Rationale not captured" is a valid (and flagged) value; a reconstructed rationale is not.
- **operator_final_call** records disagreement between board and operator — the most instructive records in the log.
- **outcome** turns the log from a decision list into a learning set: rulings whose outcomes contradicted the rationale are exactly what consistency-check and quarterly reviews should surface.
