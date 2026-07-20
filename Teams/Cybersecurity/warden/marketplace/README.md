# warden — Marketplace adoptions

**ADOPTED (runtime-install, wrapped — the rank/claude-seo pattern):**

- **GRC framework packs** — `Sushegaad/Claude-Skills-Governance-Risk-and-Compliance` (github.com/Sushegaad/Claude-Skills-Governance-Risk-and-Compliance · **MIT**, © 2026 Hemant Naik · benchmarked 97% with-skills vs 81% without). Ships one installable `.skill` package per framework: **NIST CSF, NIST 800-53, ISO 27001, SOC 2, CIS Controls, NIST AI RMF, PCI DSS, FedRAMP, DORA, NIS2** (+ 15 more). warden's `security-policy-framework` **wraps** the pack matching the operator's chosen standard (config `control_standard`) — the pack supplies the control catalog; warden supplies the risk-register + mapping + exception discipline the pack doesn't. Runtime-installed at deployment (not vendored — the specific pack depends on §8.4), surfaced via scout/suggest_connectors. Provenance in `security-policy-framework/SKILL.md`.

**Searched, no verbatim agent-skill fit (→ custom with cited standards):** dedicated risk-register / third-party-risk / exception-process agent skills — the GRC packs cover *framework content*, not the *risk-management method*, which is warden's house IP (NIST RMF / ISO 27005-aligned, cited).

Per playbook 4.3–4.4, final pack selection is operator-approved at deployment (which standard/jurisdiction).
