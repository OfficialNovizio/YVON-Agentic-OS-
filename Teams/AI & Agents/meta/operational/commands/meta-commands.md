# meta — Command Triggers

Trigger phrases → which skill fires. Pulled from each skill's "When to Use". Shortcuts are conveniences, not requirements.

| Trigger phrases (natural language) | Skill | Shortcut |
|---|---|---|
| "new agent", "agent structure", "where does X go", "folder standard", "does this agent comply" | agent-architecture-standards | /arch |
| "write a skill", "adopt this skill", "skill format", "frontmatter", "lint this skill", "is this skill compliant" | skill-authoring-standards | /skillstd |
| "test this skill", "baseline the skill", "does the skill actually work" | writing-skills (marketplace) | /skilltest |
| "who does X", "roster", "register agent", "dormant", "retire", "rename", "collision check", "export registry" | fleet-registry | /registry |
| "propose a change", "is this allowed", "charter question", "unauthorized change", "how do I change" | fleet-governance | /govern |

## Precedence (overlapping triggers)
1. "Is this ALLOWED?" → fleet-governance (charter), even if the subject is structure or format.
2. "Is this COMPLIANT?" → the relevant standards skill (architecture or authoring).
3. Authoring a skill: skill-authoring-standards (format) runs first, writing-skills (testing) second — both are required before a proposal ships.
4. Anything that ends in a change → fleet-governance takes over for routing, whatever skill started it.
