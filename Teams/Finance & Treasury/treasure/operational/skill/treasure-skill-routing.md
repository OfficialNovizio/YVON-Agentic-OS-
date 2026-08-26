# treasure · skill routing

> Non-leader. No identity layer.

## Skill map

| Skill | Entry? | Triggers |
|---|---|---|
| `entity-account-map` | ✅ | "which account to use", "signatory map", "new entity account setup" |
| `fx-exposure` | ✅ | "FX exposure", "currency mismatch", "hedge check" |
| `cash-management` | ✅ | "cash position", "idle cash", "rebalance accounts", "buffer check" |

## Cross-agent handoffs

- `felix` (F&T) — hedge decisions, rebalance decisions, cash-position input to forecasts.
- `ledger` (F&T) — currency-tagged AR/AP for FX exposure.
- `warden` (Cybersecurity) — signatory + account credential controls.
- `comply/regulated-activity-readiness` (Legal & Compliance) — new-jurisdiction bank account triggers regulatory checks.
- `board` — L3 per config.
- Shared OS: `verification-before-completion`.

## yvon-compile block

```yaml
# yvon-compile:
agent: treasure
department: "Finance & Treasury"
identity_layer: false
skills:
  - name: entity-account-map
    entry_point: true
    tier: 3
    handoffs:
      - {to: warden, dept: Cybersecurity, why: signatory + credential controls}
      - {to: comply, dept: "Legal & Compliance", why: new jurisdiction → readiness}
      - {to: board, dept: Governance, why: L3 signatory anomalies}
      - {to: verification-before-completion, dept: Shared OS}
  - name: fx-exposure
    entry_point: true
    tier: 3
    handoffs:
      - {to: felix, dept: "Finance & Treasury", why: hedge decisions consumer}
      - {to: board, dept: Governance, why: L3 material exposure}
      - {to: verification-before-completion, dept: Shared OS}
  - name: cash-management
    entry_point: true
    tier: 3
    handoffs:
      - {to: felix, dept: "Finance & Treasury", why: rebalance decisions + cash input to forecast}
      - {to: board, dept: Governance, why: L3 large-scale rebalance}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "which account", winner: entity-account-map}
  - {trigger: "FX exposure", winner: fx-exposure}
  - {trigger: "cash position", winner: cash-management}
  - {trigger: "idle cash", winner: cash-management}
```
