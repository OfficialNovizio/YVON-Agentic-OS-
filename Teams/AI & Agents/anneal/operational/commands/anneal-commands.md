# anneal — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "revise this skill", "deprecate", "retire skill", "skill version history", "unused skill" | skill-lifecycle | /lifecycle |
| "lesson learned", "post-mortem says", "this should have been caught", "anneal this", "close the loop" | self-annealing-loop | /anneal |
| "prompting practices", "confidence disclosure", "context discipline", "truncated output", "assumptions unstated" | prompt-context-engineering | /prompting |
| "audit the skills", "hardcode check", "frontmatter check", "stale assets", "run the sweep" | skill-quality-audit | /audit |

## Precedence
1. A lesson with a named incident → self-annealing-loop first (it locates the target skill; lifecycle executes).
2. Audit findings needing edits flow INTO skill-lifecycle — the audit never edits.
3. Thinking/context failures → prompt-context-engineering even when a specific skill file is also implicated (both may fire; annealing-loop coordinates).
