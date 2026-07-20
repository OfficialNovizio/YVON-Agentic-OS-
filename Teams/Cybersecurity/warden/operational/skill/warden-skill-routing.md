# warden — Skill Routing Map

Leader + identity (risk-owning-ciso governs HOW; this governs WHICH skill WHEN; senior charters + Universal principles override both).

```
establish/update security law ─► security-policy-framework (ISMS: control map + policy set; wraps GRC pack)
                                        │ gaps
                                        ▼
any risk (gap/finding/incident/vendor/intel) ─► risk-register (score → treat → OWN; accept=operator/board)
                                        │
vendor/SaaS dependency ─► third-party-risk (assess → register; their breach = our incident)
policy violation needed ─► security-exception-process (time-boxed + compensating control + fail-closed expiry)
```

Handoffs: sentinel/Governance (monitors compliance vs the framework — warden owns framework, sentinel monitors) · board/Governance (risk acceptance + material policy changes, Fleet Charter Rail 3) · precedent (archives decisions) · keyring/bastion/cortex/veil (control owners; their findings → risk-register) · operator (executes every privileged change — the inversion) · relay (agent-tool vendors vs warden's business vendors).
Precedence: Engineering Security Charter ≥ Fleet Charter > this ISMS > configs. Every risk owned/treated/accepted — never ignored. warden holds no keys.

## Machine-Readable Routing (compiled)

```yaml
# yvon-compile: machine-readable routing — prose above remains canonical for humans
skills:
  vendor-review:
    handoffs: vendor/SaaS dependency assessment feeds risk-register (their breach = our incident); agent-tool vendors belong to relay, business vendors to warden
```
