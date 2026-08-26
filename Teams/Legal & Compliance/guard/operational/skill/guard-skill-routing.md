# guard · skill routing

> Governs **which** skill fires **when**. guard is NOT the department leader (comply is), so this file has no identity layer. Prose is canonical; closing `# yvon-compile:` yaml is the compile contract (playbook §14.5).

---

## Skill map

| Skill | Role | Entry point? | Typical triggers | Feeds |
|---|---|---|---|---|
| `ip-routing` | One wrapper for all 3 marketplace skills; classify intent + load guard-config | ✅ yes | any TM clearance / OSS / infringement trigger | one of the 3 marketplace skills (internal) |
| `clearance` | Marketplace: TM knockout + similar-marks + confusion factors | ❌ no — via ip-routing | (via wrapper) | Memo returns |
| `oss-review` | Marketplace: license classification + obligations by deployment | ❌ no — via ip-routing | (via wrapper) | Memo returns |
| `infringement-triage` | Marketplace: cross-right infringement flag list (TM / copyright / patent / trade secret) | ❌ no — via ip-routing | (via wrapper) | Memo returns |
| `ip-registry` | State of the org's IP assets — register / update / renew / retire / attest | ✅ yes | "list our trademarks / patents / domains", "add this trademark", "renewal calendar" | Retrieval + downstream: `warden` (trade-secret controls), `scribe` (assignment contracts) |

2 entry points; the 3 marketplace skills are reached only via `ip-routing`.

---

## Precedence rules (when triggers overlap)

| Ambiguous phrasing | Wins | Why |
|---|---|---|
| "trademark clearance" / "can we use this mark" | `ip-routing` → `clearance` | Pre-adoption question |
| "review our dependencies" / "AGPL check" | `ip-routing` → `oss-review` | OSS license question |
| "is this infringing" / "knockoff surfaced" | `ip-routing` → `infringement-triage` | Post-observation analysis |
| "list our trademarks" / "IP inventory" | `ip-registry` | State retrieval |
| "add this trademark" | ASK — new filing (register) or new clearance for a proposed mark (clearance)? | Silent picks are defects (§0.5) |
| "trademark this" | ASK — clearance first or registration action? | ip-routing routes clearance; ip-registry records post-adoption |
| "renewal calendar" / "what's coming up" | `ip-registry` | Calendar view |

---

## Cross-agent handoffs

| To | From | Trigger |
|---|---|---|
| `scribe` (Legal & Compliance) | `ip-routing` (any) · `ip-registry` | IP terms in contracts (assignment / license / warranty / indemnity); templates for IP-heavy deals |
| `comply` (Legal & Compliance) | `ip-routing` · `ip-registry` | IP intersecting with regulated regime (export controls on encryption, data protection on trademarks in personal data) |
| `Cybersecurity/warden` | `ip-registry` · `oss-review` output | Trade-secret controls (access, DLP, exit-interview); OSS obligations that require build-time enforcement |
| `Governance/precedent` | `ip-routing` · `ip-registry` | Prior internal ruling on IP position for consistency |
| `Governance/board` | `ip-routing` · `ip-registry` | L3 assertion decisions; L3 overdue renewals per config |
| Shared OS: `verification-before-completion` | all 5 skills | Every memo / registry commit through the gate |

---

## No identity layer

guard is not the L&C department leader (comply is; see `Teams/Legal & Compliance/README.md`). Per playbook §6.1, non-leader agents carry no identity content. Tone and behaviour come from `operational/principles/guard-principles.md` (universal-only).

---

## yvon-compile block

```yaml
# yvon-compile:
agent: guard
department: "Legal & Compliance"
identity_layer: false            # non-leader — playbook §6.1
skills:
  - name: ip-routing
    entry_point: true
    tier: 3
    reaches:
      - clearance
      - oss-review
      - infringement-triage
    handoffs:
      - to: scribe
        dept: "Legal & Compliance"
        why: IP terms in contracts (assignment / license / warranty / indemnity)
      - to: comply
        dept: "Legal & Compliance"
        why: IP intersecting a regulated regime (export controls, data protection)
      - to: precedent
        dept: Governance
        why: internal ruling consistency for IP positions
      - to: board
        dept: Governance
        why: L3 assertion decisions per approval chain
      - to: verification-before-completion
        dept: Shared OS
  - name: clearance
    entry_point: false
    tier: 3
    reachable_via: ip-routing
    handoffs: []
  - name: oss-review
    entry_point: false
    tier: 3
    reachable_via: ip-routing
    handoffs: []
  - name: infringement-triage
    entry_point: false
    tier: 3
    reachable_via: ip-routing
    handoffs: []
  - name: ip-registry
    entry_point: true
    tier: 3
    handoffs:
      - to: warden
        dept: Cybersecurity
        why: trade-secret controls and OSS build-time enforcement
      - to: scribe
        dept: "Legal & Compliance"
        why: assignment / license contracts affecting registered rights
      - to: comply
        dept: "Legal & Compliance"
        why: filing-related regulatory obligations (annual reports, use requirements)
      - to: board
        dept: Governance
        why: L3 overdue renewals or systemic pattern
      - to: verification-before-completion
        dept: Shared OS
precedence:
  - trigger: "trademark clearance"
    winner: ip-routing
  - trigger: "can we use this mark"
    winner: ip-routing
  - trigger: "OSS license check"
    winner: ip-routing
  - trigger: "is this infringing"
    winner: ip-routing
  - trigger: "list our trademarks"
    winner: ip-registry
  - trigger: "renewal calendar"
    winner: ip-registry
  - trigger: "add this trademark"
    winner: null                 # ASK — new registration vs clearance
  - trigger: "trademark this"
    winner: null                 # ASK — clearance first vs registration
```
