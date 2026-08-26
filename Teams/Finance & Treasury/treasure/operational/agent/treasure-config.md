---
agent: treasure
department: Finance & Treasury
type: config
purpose: "Bank list per jurisdiction, buffer minimums, FX rate source + threshold, signatory-audit cadence."
required_by:
  - custom/entity-account-map/SKILL.md
  - custom/fx-exposure/SKILL.md
  - custom/cash-management/SKILL.md
last_updated: 2026-07-29
---

# treasure · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |
| Treasurer | `<FILL_IN>` |
| Escalation contact | `<FILL_IN>` |

## Banks (short list per jurisdiction)
| Jurisdiction | Bank | Purpose | Notes |
|---|---|---|---|
| `<FILL_IN>` | `<FILL_IN>` | operating / reserve / payroll / tax-holding | `<FILL_IN>` |

## Buffer minimums (per operating account)
| Account | Minimum balance | Currency |
|---|---|---|
| `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |

## FX rate source
| Field | Value |
|---|---|
| Preferred source | `<FILL_IN — ECB / Fed H.10 / other institutional>` |
| Refresh frequency | `<FILL_IN — daily>` |
| Material-exposure threshold (% of TTM revenue) | `<FILL_IN — e.g., 5%>` |

## Idle-cash policy
| Field | Value |
|---|---|
| Days-idle before flag | `<FILL_IN — 30>` |
| Approved yield destinations | `<FILL_IN — money-market / short-term treasury / CFO decides case-by-case>` |

## Signatory audit
| Field | Value |
|---|---|
| Cadence | `<FILL_IN — quarterly>` |
| Dual-authorisation threshold | `<FILL_IN>` |

## Escalation matrix
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine map / lookup | treasure |
| L2 | New account · signatory change · rebalance | `<FILL_IN — CFO>` |
| L3 | Material FX exposure · below-buffer · signatory anomaly | `Governance/board` (fixed) |

All `<FILL_IN>` announced per §14.7.
