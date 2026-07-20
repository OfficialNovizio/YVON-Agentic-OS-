---
name: secrets-governance
type: custom
status: built 2026-07-10 (Fable)
based_on_catalog_entry: none — new; vaulting/rotation/no-secrets-in-code (plan §3), shared rule with aegis/ops
marketplace_search: 2026-07-10 — secrets-management skills found are vault-product guides; kept custom, aligned to the no-secrets-in-code rule aegis/ops/dev already enforce.
assigned_agent: keyring (Cybersecurity / Identity & Access Management)
portable: true
includes: (no asset — method skill)
date_added: 2026-07-10
---

# Secrets Governance

## Introduction
The disciplined handling of the credentials that aren't people — API keys, tokens, DB passwords, private keys, service-account credentials, signing keys. They are vaulted (never in code or config), rotated on cadence, scoped to least privilege, and revoked when a holder leaves or a leak is suspected. Secrets are the keys agents and services use; a leaked secret is a breach in waiting.

## Purpose
Secrets leak constantly — hardcoded in a repo, pasted in a ticket, logged by accident, held by a departed contractor. Governance makes leaks rare (vaulting, no-secrets-in-code) and survivable (rotation, scoping, prompt revocation) — the credential half of least privilege, and the enforcement layer behind the fleet's existing "no secrets in code/logs" rule.

## When to Use
- Any non-human credential is created, stored, used, or rotated.
- "Where do we keep API keys," "rotate this," "a secret leaked," "hardcoded credential found."
- A leaver held service credentials (→ identity-lifecycle handoff).

## Structure / Protocol
VAULT (secrets live in a secrets manager, never in code, config files, env committed to git, tickets, or logs — the no-secrets-in-code rule aegis/dev enforce at review; keyring owns the storage discipline) → SCOPE (each secret least-privilege: a key that can do one thing, not everything) → ROTATE (on cadence + on suspected leak; rotation must be routine, not a fire drill) → REVOKE (on leaver, on leak, on decommission — promptly, across everywhere the secret worked) → DETECT (secret-scanning in repos/logs; a found secret is treated as compromised → rotate) → keyring designs the policy; operator/vault executes; found-secrets alert cortex.

## Instructions
1. **Vaulted, never in code.** Secrets in a manager, injected at runtime — never committed, never in plaintext config, never in logs (aegis's review + dev's integrity check catch leaks; keyring owns the vault discipline they enforce against).
2. **Least-privilege scope.** A secret grants the minimum: a read-only key for a read task, a single-service token, not a god-credential shared everywhere. Scope limits the blast radius of a leak.
3. **Rotate routinely.** On a cadence AND immediately on any suspected exposure; rotation is a normal operation, not an emergency — because if it's a fire drill, it won't happen when it matters.
4. **Revoke promptly and completely.** A leaked or leaver-held secret is revoked everywhere it worked; a half-revoked secret is a live door. Ties to identity-lifecycle's leaver step.
5. **Treat a found secret as compromised.** Secret-scanning finds one in a repo/log → assume it's leaked → rotate immediately, don't just delete the line. Deletion doesn't un-leak.
6. **keyring designs; operator/vault executes; leaks alert cortex.** The inversion — keyring sets policy and detects, the operator/vault holds and rotates, cortex responds to a leak.

## Output Format
```
## Secret: [name/type] — [what it grants]
Storage: [vaulted ✓ · never in code/config/log ✓] · Scope: [least-privilege ✓]
Rotation: [cadence · last rotated] · Revocation: [on leaver/leak/decommission]
Leak status: [none / found → treated-compromised → rotated] → cortex if leaked
Designed by keyring · held/rotated by operator/vault
```

## Principles
- **Vaulted, never in code/config/logs** — the enforced no-secrets rule.
- **Least-privilege scope** — one key, one job; limit the blast radius.
- **Rotate routinely** — normal op, not a fire drill.
- **Revoke promptly + completely** — a half-revoked secret is a live door.
- **A found secret is a compromised secret** — rotate, don't just delete.
- **keyring designs; operator/vault executes** — the inversion.

## Fallback
- No secrets manager yet → this is finding #1 (high risk → warden); interim, a tightly-controlled encrypted store + strict no-commit discipline, labeled provisional; a plaintext-secrets-in-repo state is a top risk.
- Legacy system can't use a vault → inject via environment at deploy, scope tightly, rotate manually on cadence, log as an exception (warden).

## Boundaries with Other Skills
- **identity-lifecycle** (sibling): leaver-held secrets are revoked in JML.
- **privileged-access-management** (sibling): privileged credentials are the most sensitive secrets.
- **aegis / dev (Engineering)**: enforce no-secrets-in-code at review; keyring owns the storage/rotation discipline they enforce against — shared rule, clean split.
- **cortex**: a detected leaked secret triggers response; **bastion**: secret-scanning may run in its posture tooling.
- **warden**: no-vault / plaintext-secret states are top register risks.
