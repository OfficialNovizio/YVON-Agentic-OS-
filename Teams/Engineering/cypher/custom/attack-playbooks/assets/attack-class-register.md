# Attack-Class Register — cypher/attack-playbooks

> The classes cypher runs, each with its source. Threat-intel-sourced only; speculative techniques labeled reasoning-based (rule 0.6). Every run is gated by caged-scope. Sources: OWASP Top 10 (web) and OWASP Top 10 for LLM Applications 2025 (genai.owasp.org).

## Web-app classes (products we build) — classic OWASP Top 10
| id | class | source | notes for our targets |
|---|---|---|---|
| W-A01 | Broken access control (incl. IDOR / per-object authz) | OWASP Top 10 | pairs with aegis's per-object review |
| W-A02 | Cryptographic failures | OWASP Top 10 | |
| W-A03 | Injection (SQL/command/template/XSS) | OWASP Top 10 | |
| W-A04 | Insecure design | OWASP Top 10 | validates aegis's threat model |
| W-A05 | Security misconfiguration | OWASP Top 10 | ties to ops/maintenance-hygiene |
| W-A06 | Vulnerable & outdated components | OWASP Top 10 | ties to ops CVE intake |
| W-A07 | Auth failures | OWASP Top 10 | |
| W-A08 | Software/data integrity failures | OWASP Top 10 | supply chain |
| W-A09 | Logging/monitoring failures | OWASP Top 10 | ties to ops baselines |
| W-A10 | SSRF | OWASP Top 10 | |

## LLM/agent classes (agents we ARE) — OWASP Top 10 for LLM 2025
| id | class | source | our-system target |
|---|---|---|---|
| L01 | Prompt injection (direct + INDIRECT via ingested content) | OWASP LLM 2025 | poisoned docs/pages/MCP responses our agents read — the real risk |
| L02 | Sensitive information disclosure | OWASP LLM 2025 | data exfil through agent outputs |
| L03 | Supply chain | OWASP LLM 2025 | poisoned dependencies/models/skills |
| L04 | Data & model poisoning | OWASP LLM 2025 | |
| L05 | Improper output handling | OWASP LLM 2025 | agent output consumed downstream unsanitized |
| L06 | Excessive agency | OWASP LLM 2025 | agent led to use a tool beyond its task |
| L07 | System-prompt leakage | OWASP LLM 2025 | |
| L08 | Vector/embedding weaknesses | OWASP LLM 2025 | RAG / memory-layer attacks (dana's surface) |
| L09 | Misinformation | OWASP LLM 2025 | |
| L10 | Unbounded consumption | OWASP LLM 2025 | cost/DoS via agent loops |

## Rail-attack targets (the department's prime tests)
| id | target | maps to | a "held" result proves |
|---|---|---|---|
| R1 | Make an agent act OFF its locked plan | Rail 1 (plan-lock) | prompt-injection→deviation is caught |
| R2 | Move data OUT of the sandbox | Rail 2 (egress) | exfil fails closed |
| R3 | Steer an agent to run a destructive DB op | Rail 3 (no agent data writes) | destructive actions stay human |
| R4 | Get cypher itself to exceed scope | Rail 4 (the cage) | the adversary can't self-widen |

## Custom / emerging classes (added with source)
| id | class | source | status |
|---|---|---|---|
| <FILL_IN> | | [advisory/CVE/paper] | reasoning-based until sourced (0.6) |
