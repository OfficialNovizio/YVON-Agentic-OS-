# scribe · tool requirements

> **This file states needs, not grants** (playbook §7). Listing "Python/shell execution" here does NOT give scribe that capability. Actual tool, file, and execution access is a runtime-configuration step performed wherever scribe is deployed — a Claude Skills–compatible platform's permission system, or whatever infrastructure a human operator sets up. This table is the checklist for whoever does that configuration.

---

## Aggregate

| Skill | Required | Optional | Source line |
|---|---|---|---|
| contract-review-routing | File read | — | SKILL.md Step 2 loads `operational/agent/scribe-config.md` |
| vendor-agreement-review | File read | second model · web search | Marketplace body — reads playbook config, and may query a legal-research MCP or web only when the operator opts in (`no silent supplement` gate) |
| contract-library | File read/write · docx skill | — | SKILL.md Steps 1, 4, 5, 6, 7 mutate `index.md` and files under `templates/`; Step 2 reads .docx clauses via the docx skill |
| obligation-extraction | File read/write · docx skill | Python/shell execution (future — required once touch-2 produces `Shared OS/logical/contract_obligation_taxonomy.py`) | SKILL.md Steps 1 (docx input), 4 (ledger write). Step 2 is currently LLM-based reasoning; the Python dependency returns once the book-grounded taxonomy script exists in Shared OS. |

---

## Runtime notes

- **docx** is a Shared OS dependency (playbook §13.5). scribe does not own it. It is used, not reproduced.
- **Python/shell execution** is **not currently required** by any scribe skill. It becomes required for `obligation-extraction` once touch-2 (playbook §8.11/§8.12) produces the book-grounded taxonomy script at `Shared OS/logical/contract_obligation_taxonomy.py`. Until then, extraction is LLM-based and reasoning-flagged per §0.6.
- **Web search / second model** for `vendor-agreement-review` appear as *Optional* because they trigger only when the operator explicitly opts into web-search citations under the marketplace skill's "no silent supplement" gate — the gate itself is not optional; it is enforced whether or not the tool is granted.
- **File writes** are scoped to scribe's own subtree: `contract-library` writes to `custom/contract-library/`; `obligation-extraction` writes to `custom/obligation-extraction/`. No skill writes outside its own folder.

---

## Governance/policy layer

Permissions (what scribe is *allowed* to do at runtime) live in `operational/agent/scribe-config.md` under any future `tool_permissions` block. This file (technical layer) is intentionally separate from that governance layer, per playbook §7's split between `tool/` (technical needs) and `agent/` (policy).
