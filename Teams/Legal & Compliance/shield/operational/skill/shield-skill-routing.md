# shield · skill routing

> Governs **which** skill fires **when**. shield is non-leader (comply leads) — no identity layer. Closing `# yvon-compile:` yaml is the compile contract (§14.5).

## Skill map

| Skill | Role | Entry point? | Typical triggers | Feeds |
|---|---|---|---|---|
| `dispute-log` | Live registry of disputes; response-deadline calendar; exposure aggregate | ✅ yes | "log this dispute", "list our disputes", "upcoming response deadlines" | Feeds `board` on L3; cross-refs `scribe` / `comply` / `guard` slugs |
| `case-assessment-memo` (marketplace) | Claim-by-claim + damages + defenses + insurance + venue + recommendation memo | ✅ yes | "case assessment", "assess this dispute", "what's our exposure" | Exposure range → `dispute-log` update |

Both are entry points; no wrapper needed (marketplace skill has no plugin config path).

## Precedence rules

| Ambiguous phrasing | Wins | Why |
|---|---|---|
| "log this dispute" · "register this demand letter" | `dispute-log` | State mutation |
| "case assessment" · "assess this claim" · "damages exposure" | `case-assessment-memo` | Analytical work |
| "what disputes do we have" · "list our disputes" | `dispute-log` (retrieve) | State query |
| "how bad is this" · "what's our exposure" (single dispute) | `case-assessment-memo` | Analysis, not registry |
| "aggregate exposure" · "portfolio exposure" | `dispute-log` (Step 7) | Cross-dispute aggregation |
| "we got sued" | ASK — log first, then assess? Or one dispute assessment already in flight? | Silent picks are defects |

## Cross-agent handoffs

| To | From | Trigger |
|---|---|---|
| `Governance/board` | `dispute-log` · `case-assessment-memo` | L2/L3 escalation per config; always-L3 dispute types; overdue-deadline auto-escalate |
| `scribe` (Legal & Compliance) | `dispute-log` | Pattern of disputes on a contract template → template revision |
| `comply` (Legal & Compliance) | `dispute-log` | Regulatory-enforcement dispute cross-refs `comply/obligation-register` |
| `guard` (Legal & Compliance) | `dispute-log` | IP dispute cross-refs `guard/ip-registry` |
| `Cybersecurity/warden` | `dispute-log` | Data-breach / security-incident disputes link warden's incident records |
| `Governance/precedent` | `case-assessment-memo` · `dispute-log` closure | Dispute resolution establishes internal ruling |
| `Finance & Treasury` (when built) | `dispute-log` closure | Settlement / judgment payments for GL |
| Shared OS: `verification-before-completion` | both skills | Every memo + every state commit |

## No identity layer

shield is non-leader; tone from `operational/principles/shield-principles.md` (universal-only).

## yvon-compile block

```yaml
# yvon-compile:
agent: shield
department: "Legal & Compliance"
identity_layer: false
skills:
  - name: dispute-log
    entry_point: true
    tier: 3
    handoffs:
      - to: board
        dept: Governance
        why: L2/L3 escalation per shield-config Escalation matrix + always-L3 auto-triggers
      - to: scribe
        dept: "Legal & Compliance"
        why: pattern of disputes on a contract template → template revision
      - to: comply
        dept: "Legal & Compliance"
        why: regulatory-enforcement disputes cross-ref obligation-register
      - to: guard
        dept: "Legal & Compliance"
        why: IP disputes cross-ref ip-registry
      - to: warden
        dept: Cybersecurity
        why: data-breach / security-incident disputes link incident records
      - to: precedent
        dept: Governance
        why: closure establishes internal ruling
      - to: verification-before-completion
        dept: Shared OS
  - name: case-assessment-memo
    entry_point: true
    tier: 2
    handoffs:
      - to: dispute-log
        dept: "Legal & Compliance"   # this agent
        why: exposure range + disposition recommendation feeds registry update
      - to: precedent
        dept: Governance
        why: analytical output informs internal ruling on similar future disputes
      - to: verification-before-completion
        dept: Shared OS
precedence:
  - trigger: "log this dispute"
    winner: dispute-log
  - trigger: "case assessment"
    winner: case-assessment-memo
  - trigger: "list our disputes"
    winner: dispute-log
  - trigger: "what's our exposure"
    winner: case-assessment-memo   # for a single dispute
  - trigger: "portfolio exposure"
    winner: dispute-log            # aggregate
  - trigger: "we got sued"
    winner: null                   # ASK — log then assess, or already handling?
```
