---
name: secrets-governance
agent: keyring
department: Cybersecurity
version: 1.5.0
tier: 2
description: |
  **Basic Vault Setup:** ```bash # Start Vault in development mode (never for production) vault server… (yvon)
triggers:
  - secrets governance
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/keyring/marketplace/secrets-governance/SKILL.md
  source_hash: ed9268082e1330bb476746080e05c30ca64902df15094acf96fe8756040deb89
  generated: 2026-07-20T03:20:23.120Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/keyring/marketplace/secrets-governance/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js keyring -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: keyring — Cybersecurity · skill: secrets-governance"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"keyring\",\"skill\":\"secrets-governance\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- Setting up a new secrets management infrastructure.
- Rotating database credentials, API keys, or certificates.
- Auditing current secrets storage practices.
- Responding to a potential credential leak.
- Implementing secrets management in CI/CD pipelines.
- Managing secrets across multiple environments (dev/staging/prod).

## Purpose

Secrets are the keys to your infrastructure. Hardcoded credentials, unrotated keys, and secrets stored in configuration files or environment variables are among the most common and dangerous security vulnerabilities. Proper secrets management ensures that credentials are stored securely, accessed only by authorized services, rotated regularly, and audited for compliance.

## Protocol

# Secrets Management

## Introduction
Securely manage your application secrets — database credentials, API keys, tokens, certificates, and other sensitive configuration — using industry-standard tools and practices. This skill covers the full lifecycle of secrets management: secure storage, access control, rotation, and auditing.

## Purpose
Secrets are the keys to your infrastructure. Hardcoded credentials, unrotated keys, and secrets stored in configuration files or environment variables are among the most common and dangerous security vulnerabilities. Proper secrets management ensures that credentials are stored securely, accessed only by authorized services, rotated regularly, and audited for compliance.

## When to Use
- Setting up a new secrets management infrastructure.
- Rotating database credentials, API keys, or certificates.
- Auditing current secrets storage practices.
- Responding to a potential credential leak.
- Implementing secrets management in CI/CD pipelines.
- Managing secrets across multiple environments (dev/staging/prod).

## Secrets Management Tools

### HashiCorp Vault
HashiCorp Vault is the most comprehensive secrets management solution. It provides:
- **Dynamic Secrets**: Generate on-demand, short-lived credentials for databases, cloud providers, and more.
- **Encryption as a Service**: Encrypt/decrypt data without managing encryption keys.
- **Key Rotation**: Automatic rotation of secrets.
- **Audit Logging**: Comprehensive audit trail of all secret access.

**Basic Vault Setup:**
```bash
# Start Vault in development mode (never for production)
vault server -dev

# Set the VAULT_ADDR environment variable
export VAULT_ADDR='http://127.0.0.1:8200'

# Store a secret
vault kv put secret/myapp/database username=dbuser password=s3cret

# Retrieve a secret
vault kv get secret/myapp/database
```

**Production Vault Configuration (Raft Storage):**
```hcl
storage "raft" {
  path = "/vault/data"
  node_id = "node1"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = false
  tls_cert_file = "/etc/vault/tls/cert.pem"
  tls_key_file  = "/etc/vault/tls/key.pem"
}

api_addr = "https://vault.example.com:8200"
cluster_addr = "https://vault.example.com:8201"
```

### AWS Secrets Manager
AWS-native secrets management with automatic rotation for RDS databases.

**Creating and Rotating a Secret:**
```bash
# Create a secret
aws secretsmanager create-secret \
    --name prod/mysql/db1 \
    --secret-string '{"username":"dbadmin","password":"InitialPassword123!"}'

# Rotate the secret immediately
aws secretsmanager rotate-secret \
    --secret-id prod/mysql/db1

# Retrieve a secret
aws secretsmanager get-secret-value \
    --secret-id prod/mysql/db1 \
    --query SecretString \
    --output text
```

**Automatic Rotation with Lambda:**
```python
import json
import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """Rotate a secret in AWS Secrets Manager."""
    secret_id = event['SecretId']
    client_token = event['ClientRequestToken']
    step = event['Step']
    
    client = boto3.client('secretsmanager')
    
    try:
        if step == 'createSecret':
            # Generate a new password
            new_password = generate_password()
            client.put_secret_value(
                SecretId=secret_id,
                ClientRequestToken=client_token,
                SecretString=json.dumps({"password": new_password})
            )
            
        elif step == 'setSecret':
            # Update the database with the new password
            update_database_password(new_password)
            
        elif step == 'testSecret':
            # Test the new password
            test_database_connection(new_password)
            
        elif step == 'finishSecret':
            # Mark the secret as ready
            logger.info(f"Rotation completed for secret {secret_id}")
            
    except Exception as e:
        logger.error(f"Rotation failed: {str(e)}")
        raise
```

### Azure Key Vault
Microsoft's cloud-based secrets management with HSM-backed key protection.

```bash
# Create a Key Vault
az keyvault create \
    --name myvault \
    --resource-group myrg \
    --location eastus

# Store a secret
az keyvault secret set \
    --vault-name myvault \
    --name database-password \
    --value "P@ssw0rd123!"

# Retrieve a secret
az keyvault secret show \
    --vault-name myvault \
    --name database-password \
    --query value \
    --output tsv
```

### Google Secret Manager
GCP-native secrets management with IAM integration.

```bash
# Create a secret
echo -n "my-secret-password" | gcloud secrets create my-secret \
    --data-file=-

# Access a secret
gcloud secrets versions access latest \
    --secret=my-secret

# Add IAM policy binding
gcloud secrets add-iam-policy-binding my-secret \
    --member=user:example@example.com \
    --role=roles/secretmanager.secretAccessor
```

### Kubernetes Secrets
Kubernetes-native secret storage (base64 encoded, consider using external secrets operators for production).

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  database-url: bXlzcWw6Ly91c2VyOnBhc3N3b3JkQGxvY2FsaG9zdC9kYg==
  api-key: c2tjcmV0LWFwaS1rZXktMTIzNDU2
```

**Best Practice:** Use external secrets operators (e.g., External Secrets Operator, Sealed Secrets) to sync secrets from Vault or cloud providers to Kubernetes rather than storing them in the cluster directly.

## Security Best Practices

### Secret Creation
- ✅ Use strong, randomly generated passwords (min 16 characters)
- ✅ Use separate secrets per environment and service
- ✅ Implement least-privilege access to secrets
- ✅ Enable secret versioning
- ❌ Never hardcode secrets in code
- ❌ Never commit secrets to version control
- ❌ Never share secrets via messaging apps or email
- ❌ Never log secrets or include them in error messages

### Secret Rotation
- ✅ Rotate database credentials every 90 days
- ✅ Rotate API keys every 180 days or on employee departure
- ✅ Automate rotation where possible
- ✅ Test rotation procedures regularly
- ❌ Never share the same secret across multiple services
- ❌ Never extend rotation periods without justification

### Access Control
- ✅ Implement least-privilege access to secrets
- ✅ Use role-based access control (RBAC) for secret management
- ✅ Enable audit logging for all secret access
- ✅ Use short-lived credentials where possible
- ❌ Never use root/admin accounts for routine secret access
- ❌ Never bypass access controls for convenience

### Monitoring and Auditing
- ✅ Monitor for unauthorized secret access attempts
- ✅ Alert on unusual secret access patterns
- ✅ Regularly audit secret usage and access
- ✅ Keep audit logs for minimum 1 year
- ✅ Review and revoke unused secrets

## Manual Rotation Process
When automated rotation is not available:

1. **Generate new credentials** in the secrets manager
2. **Update all dependent services** with the new credentials
3. **Test the new credentials** thoroughly
4. **Deprecate the old credentials** (mark as deprecated, allow grace period)
5. **Revoke the old credentials** after confirmation that all services use the new ones
6. **Document the rotation** including date, reason, and any issues encountered

## Output Format
```
## Secrets Management Review
Tool: [Vault / AWS SM / Azure KV / GCP SM / K8s]
Secrets managed: [count]
Last rotation: [date] · Rotation cadence: [frequency]
Access control: [RBAC configured? · audit logging enabled?]
Findings: [hardcoded secrets · unrotated keys · over-permissioned access]
Remediation: [actions taken or planned]
Compliance: [aligned with no-secrets-in-code rule?]
```

## Principles
1. **Never hardcode secrets** — secrets in code are compromised secrets.
2. **Rotate regularly** — rotation should be routine, not a fire drill.
3. **Least privilege** — a secret grants the minimum access needed.
4. **Audit everything** — every access, change, and rotation is logged.
5. **Test rotations** — untested rotation procedures will fail when needed most.
6. **Short-lived over static** — dynamic, time-limited secrets are better than long-lived static ones.
7. **Seperate per environment** — dev secrets never touch production.

## Fallback
- **No secrets manager available** → use encrypted environment variables with manual rotation, labeled "provisional." Immediately flag as a risk to warden.
- **Legacy hardcoded secrets found** → document the location, scope, and risk. Prioritize migration to a secrets manager. The secret is treated as compromised until confirmed otherwise.
- **Rotation failure** → revert to previous credentials immediately, document the failure, and reschedule rotation after fixing the issue.

## Boundaries with Other Skills
- **access-control-policy** (Hack23): secrets access follows the same RBAC and least-privilege model.
- **keyring's privileged-access-management** (sibling): service account and machine identity secrets follow PAM discipline.
- **aegis/ops (Engineering)**: enforce no-secrets-in-code at code review; this skill provides the vaulting alternative they reference.
- **cortex (Cybersecurity)**: a leaked secret is a detection event; found secrets alert cortex for IR.
- **warden**: secrets gaps (no vault, unrotated keys, hardcoded creds) are register risks.

## Boundaries & handoffs

non-human credential ─► secrets-governance (vault, scope, rotate, revoke; no-secrets-in-code) ─► operator/vault executes

## Output format

```

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"keyring\",\"skill\":\"secrets-governance\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
