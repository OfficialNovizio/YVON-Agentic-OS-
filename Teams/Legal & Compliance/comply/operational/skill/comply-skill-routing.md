# comply · skill routing

> Governs **which** skill fires **when**, and what wins when triggers overlap. comply IS the Legal & Compliance department leader (playbook §6.1), so this file *does* have an identity layer note — the leader's Voice/tone comes from `identity/`; this file governs *which/when*, not how.
>
> Prose below is canonical for humans. The closing `# yvon-compile:` yaml block is what the compiler reads (playbook §14.5).

---

## Skill map

| Skill | Role | Entry point? | Typical triggers | Feeds |
|---|---|---|---|---|
| `reg-monitor-routing` | Wrap `reg-feed-watcher`; bind config; detect intent | ✅ yes | "check the feeds", "what's new", "regulatory update", "reg update", "watch the regulators", scheduled invocation | `reg-feed-watcher` (internal) |
| `reg-feed-watcher` | Marketplace: pull, classify, enrich, digest | ❌ no — reached only via routing | (via wrapper) | Digest returns to operator |
| `obligation-register` | State of live compliance obligations — register, update, attest, retire, review | ✅ yes | "are we compliant", "compliance check", "add this obligation", "list obligations", "quarterly review" | Downstream: `warden` (controls), `scribe` (contract clauses), `precedent` (rulings) |
| `regulated-activity-readiness` | Pre-launch gate — does this feature/activity trigger a regime? | ✅ yes | "is this feature regulated", "do we need a licence", "launch gate", "can we ship this" | Writes to `obligation-register`; escalates L3 for always-L3 categories |

3 of 4 skills are entry points; the marketplace skill is not.

---

## Precedence rules (when triggers overlap)

| Ambiguous phrasing | Wins | Why |
|---|---|---|
| "compliance check" | `obligation-register` | State query — "are we compliant with X" |
| "check the feeds" / "what's new" | `reg-monitor-routing` | Feed pull, not state query |
| "can we ship X" / "launch check for X" | `regulated-activity-readiness` | Pre-launch gate |
| "add this obligation" | `obligation-register` | Register mutation |
| "does X trigger a regime" | `regulated-activity-readiness` | Same idea, different phrasing |
| "compliance status of venture Y" | `obligation-register` (retrieve by venture) | State query |
| "did any regulator move today" | `reg-monitor-routing` | Feed pull |

Ambiguous → ASK. Silent picks are defects (playbook §0.5).

---

## Cross-agent handoffs

| To | From | Trigger |
|---|---|---|
| `Cybersecurity/warden` | `obligation-register` · `regulated-activity-readiness` | Obligation requires an internal control (SOC 2, breach-response, access-review) |
| `scribe` (Legal & Compliance) | `obligation-register` · `regulated-activity-readiness` · `reg-monitor-routing` | Obligation requires a contract clause / DPA / template update |
| `Governance/precedent` | any comply skill | Internal ruling on an obligation → precedent for consistency |
| `Governance/board` | any comply skill | L3 per Escalation matrix (config) OR any always-L3 category BLOCKED |
| `meta` (AI & Agents) | `regulated-activity-readiness` | AI-related activity triggering EU AI Act or US AI EO — co-consult |
| Shared OS: `verification-before-completion` | all four skills | Every deliverable (digest, register commit, verdict) goes through the gate |

---

## Identity layer

comply IS the department leader (playbook §6.1). Its identity persona (Louis Brandeis — first pass on Path 1) governs *how* comply communicates and *what it holds firm on* — precise citation, disclosure over concealment, structural remedies over ad-hoc fixes. Tone lives in `identity/brandeis-disclosure.md`. This routing file governs *which skill / when*, not tone.

---

## yvon-compile block

```yaml
# yvon-compile:
agent: comply
department: "Legal & Compliance"
identity_layer: true            # department leader — playbook §6.1
skills:
  - name: reg-monitor-routing
    entry_point: true
    tier: 3
    reaches:
      - reg-feed-watcher            # internal wrap per §4.8
    handoffs:
      - to: obligation-register
        dept: "Legal & Compliance"
        why: material feed items become new obligations
      - to: precedent
        dept: Governance
        why: internal ruling on how to interpret a new regulation
      - to: warden
        dept: Cybersecurity
        why: regulation requires control-side implementation
      - to: scribe
        dept: "Legal & Compliance"
        why: regulation requires contract-clause updates
      - to: verification-before-completion
        dept: Shared OS
  - name: reg-feed-watcher
    entry_point: false
    tier: 2
    reachable_via: reg-monitor-routing
    handoffs: []
  - name: obligation-register
    entry_point: true
    tier: 3
    handoffs:
      - to: warden
        dept: Cybersecurity
        why: obligation requires an internal control
      - to: scribe
        dept: "Legal & Compliance"
        why: obligation requires a contract clause / DPA
      - to: precedent
        dept: Governance
        why: obligation ruling / interpretation for consistency
      - to: board
        dept: Governance
        why: L2/L3 escalation per Escalation matrix
      - to: verification-before-completion
        dept: Shared OS
  - name: regulated-activity-readiness
    entry_point: true
    tier: 3
    handoffs:
      - to: obligation-register
        dept: "Legal & Compliance"   # this agent
        why: CONDITIONAL / BLOCKED verdicts create obligations
      - to: warden
        dept: Cybersecurity
        why: regime requires internal control
      - to: scribe
        dept: "Legal & Compliance"
        why: regime requires contract clause
      - to: board
        dept: Governance
        why: BLOCKED in always-L3 category
      - to: meta
        dept: "AI & Agents"
        why: AI-related regime (EU AI Act, US AI EO) — co-consult
      - to: verification-before-completion
        dept: Shared OS
precedence:
  - trigger: "compliance check"
    winner: obligation-register
  - trigger: "check the feeds"
    winner: reg-monitor-routing
  - trigger: "launch gate"
    winner: regulated-activity-readiness
  - trigger: "add this obligation"
    winner: obligation-register
  - trigger: "does X trigger a regime"
    winner: regulated-activity-readiness
  - trigger: "did any regulator move today"
    winner: reg-monitor-routing
```
