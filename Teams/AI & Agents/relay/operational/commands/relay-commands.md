# relay — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "connect mcp", "new tool", "register tool", "tool access", "what's connected", "revoke" | mcp-tool-registry | /register |
| "who can call", "grant access", "access audit", "does X need this" | least-privilege-grants | /grants |
| "egress", "allowlist", "sandbox domains", "blocked domain", "denied call" | egress-allowlist-authoring | /egress |
| "integration design", "retry", "idempotent", "circuit breaker", "tool keeps failing", "contract drift" | integration-patterns | /integrate |

## Precedence
1. Incident language ("blocked", "denied", "suspicious") → egress-allowlist-authoring's reconcile path first.
2. "New tool" always starts at mcp-tool-registry (registration precedes grants, grants precede integration review).
3. Grants questions inside a registration flow stay in least-privilege-grants; the registry only records.
