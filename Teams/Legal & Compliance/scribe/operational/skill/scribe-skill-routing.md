# scribe · skill routing

> Governs **which** skill fires **when**, and what wins when triggers overlap. Does NOT govern tone — scribe is not the department leader (playbook §6.1), so this file has no identity layer. Principles and tone rules live in `operational/principles/scribe-principles.md`.
>
> Prose below is canonical for humans. The closing `# yvon-compile:` yaml block is what the compiler reads (playbook §14.5). Keep them in sync.

---

## Skill map

| Skill | Role | Entry point? | Typical triggers | Feeds |
|---|---|---|---|---|
| `contract-review-routing` | Wrap the marketplace review skill; bind config; classify + route | ✅ yes | "review this contract", "review this vendor MSA", "is this contract okay", "check this SaaS agreement" | `vendor-agreement-review` (internal) |
| `vendor-agreement-review` | Marketplace: term-by-term deviation memo | ❌ no — `user-invocable: false` | (reached only via `contract-review-routing`) | Memo returns to operator |
| `contract-library` | Register / classify / version / publish / retire / retrieve templates | ✅ yes | "register this template", "list templates", "find the MSA template", "version bump this template", "retire this template" | Supplies template metadata to `contract-review-routing` |
| `obligation-extraction` | Post-signing obligation ledger | ✅ yes | "extract obligations from this contract", "track this contract", "what am I on the hook for", "what renewals are coming up" | Consumes `contract-library` slugs |

Three of the four skills are entry points; the marketplace skill is not. Any request reaching the marketplace skill directly is a bug.

---

## Precedence rules (when triggers overlap)

| Ambiguous phrasing | Wins | Why |
|---|---|---|
| "add this contract" | ASK — do not guess | Could mean register template (`contract-library`) or add signed to ledger (`obligation-extraction`) |
| "review this contract" | `contract-review-routing` | Review is pre-signing; unambiguous |
| "extract obligations" | `obligation-extraction` | Post-signing; unambiguous |
| "what templates" / "list templates" | `contract-library` | Unambiguous |
| "this contract" (no verb) | ASK — do not guess | State (registered? signed? being reviewed?) determines skill |
| Multiple contracts in scope, no `slug` | ASK for slug or counterparty first | Skills refuse to guess a match |

Do not silently pick a skill on ambiguity. Ask (playbook §0.5).

---

## Cross-agent handoffs

| To | From | Trigger |
|---|---|---|
| `Governance/precedent` | any scribe skill | Internal ruling-consistency question surfaces during review or template-edit |
| `Governance/board` | `contract-review-routing` | L3 escalation per `scribe-config.md` Escalation matrix |
| `Cybersecurity/warden` | `contract-review-routing`, `contract-library`, `obligation-extraction` | Any commitment that requires an internal control (SOC 2 evidence, breach-notification SLA, audit cadence) |

Handoffs are one-directional out of scribe. Incoming handoffs (from Governance or Cybersecurity into scribe) route via the operator through a scribe entry point — scribe does not accept unsolicited inbound.

---

## Inherited dependencies (Shared OS)

| Dependency | Used by | Purpose |
|---|---|---|
| `Shared OS/docx` | `contract-library`, `obligation-extraction` | Read/write `.docx` templates and signed contracts |
| `Shared OS/verification-before-completion` | all four skills | Playbook §5 verification gate before returning a deliverable |

Inherited, not owned (playbook §13.1). Do not reproduce these capabilities inside a scribe skill.

---

## No identity layer

scribe is not the Legal & Compliance department leader (that is `comply`; see `Teams/Legal & Compliance/README.md`). Per playbook §6.1, non-leader agents carry no identity content. Tone and behavioural guardrails come from `operational/principles/scribe-principles.md` (universal-only, no identity-flavoured section).

---

## yvon-compile block

```yaml
# yvon-compile:
agent: scribe
department: "Legal & Compliance"
identity_layer: false          # non-leader — playbook §6.1
skills:
  - name: contract-review-routing
    entry_point: true
    tier: 3
    reaches:
      - vendor-agreement-review        # internal wrap per §4.8
    handoffs:
      - to: precedent
        dept: Governance
        why: internal ruling-consistency question during review
      - to: warden
        dept: Cybersecurity
        why: control-design question flagged during review
      - to: board
        dept: Governance
        why: L3 escalation per scribe-config Escalation matrix
      - to: verification-before-completion
        dept: Shared OS
        why: playbook §5 verification gate before memo returns
  - name: vendor-agreement-review
    entry_point: false
    tier: 2
    reachable_via: contract-review-routing
    handoffs: []
  - name: contract-library
    entry_point: true
    tier: 3
    handoffs:
      - to: precedent
        dept: Governance
        why: prior ruling on a similar template edit
      - to: warden
        dept: Cybersecurity
        why: security-control commitment recorded in a template
      - to: docx
        dept: Shared OS
        why: read/write .docx template files
      - to: verification-before-completion
        dept: Shared OS
        why: publish and retire actions gated by verification
  - name: obligation-extraction
    entry_point: true
    tier: 4
    handoffs:
      - to: contract-library
        dept: Legal & Compliance   # this agent's peer
        why: slug lookup to link obligations to their template
      - to: precedent
        dept: Governance
        why: anomalous obligation — house-standard question
      - to: warden
        dept: Cybersecurity
        why: audit and reporting obligations that need control tracking
      - to: docx
        dept: Shared OS
        why: parse signed .docx contracts
      - to: verification-before-completion
        dept: Shared OS
        why: ledger commit gated by verification
precedence:
  - trigger: "add this contract"
    winner: null                 # ASK operator; do not guess
  - trigger: 'this contract (no verb)'
    winner: null                 # ASK operator
  - trigger: "review this contract"
    winner: contract-review-routing
  - trigger: "extract obligations"
    winner: obligation-extraction
  - trigger: "list templates"
    winner: contract-library
  - trigger: "register this template"
    winner: contract-library
```
