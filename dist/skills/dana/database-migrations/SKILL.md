---
name: database-migrations
agent: dana
department: Engineering
version: 1.1.0
tier: 2
description: |
  Safe, reversible database schema changes for production systems. (yvon)
triggers:
  - database migrations
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/dana/marketplace/database-migrations/SKILL.md
  source_hash: fca2537e93457568837e5c4b3af340564809154e57de0543937cc192e07f0c82
  generated: 2026-07-20T03:20:22.606Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/dana/marketplace/database-migrations/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js dana -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: dana — Engineering · skill: database-migrations"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dana\",\"skill\":\"database-migrations\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "database migrations".

## Purpose

Safe, reversible database schema changes for production systems.

## Protocol

# Database Migration Patterns

Safe, reversible database schema changes for production systems.

> **Rail 3 (Security Charter — senior to this skill):** dana *authors* every command and script below; **the operator executes them**. Any instruction here that says "run/apply/deploy" means "produce the script + plain-language summary per `migration-discipline`, hand to operator." No exceptions, mid-incident included.

## When to Activate

- Creating or altering database tables
- Adding/removing columns or indexes
- Running data migrations (backfill, transform)
- Planning zero-downtime schema changes
- Setting up migration tooling for a new project

## Core Principles

1. **Every change is a migration** — never alter production databases manually
2. **Migrations are forward-only in production** — rollbacks use new forward migrations
3. **Schema and data migrations are separate** — never mix DDL and DML in one migration
4. **Test migrations against production-sized data** — a migration that works on 100 rows may lock on 10M
5. **Migrations are immutable once deployed** — never edit a migration that has run in production

## Migration Safety Checklist

Before any migration is handed to the operator:

- [ ] Migration has both UP and DOWN (or is explicitly marked irreversible)
- [ ] No full table locks on large tables (use concurrent operations)
- [ ] New columns have defaults or are nullable (never add NOT NULL without default)
- [ ] Indexes created concurrently (not inline with CREATE TABLE for existing tables)
- [ ] Data backfill is a separate migration from schema change
- [ ] Tested against a copy of production data
- [ ] Rollback plan documented

## PostgreSQL Patterns

### Adding a Column Safely

```sql
-- GOOD: Nullable column, no lock
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- GOOD: Column with default (Postgres 11+ is instant, no rewrite)
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- BAD: NOT NULL without default on existing table (locks + rewrites every row)
ALTER TABLE users ADD COLUMN role TEXT NOT NULL;
```

### Adding an Index Without Downtime

```sql
-- BAD: Blocks writes on large tables
CREATE INDEX idx_users_email ON users (email);

-- GOOD: Non-blocking, allows concurrent writes
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
-- Note: CONCURRENTLY cannot run inside a transaction block;
-- most migration tools need special handling for this
```

### Renaming a Column (Zero-Downtime, expand-contract)

```sql
-- Step 1: Add new column (migration 001)
ALTER TABLE users ADD COLUMN display_name TEXT;
-- Step 2: Backfill (migration 002, data migration)
UPDATE users SET display_name = username WHERE display_name IS NULL;
-- Step 3: App reads/writes BOTH columns (application deploy)
-- Step 4: Stop writing old column, drop it (migration 003)
ALTER TABLE users DROP COLUMN username;
```

### Removing a Column Safely

Remove all application references first → deploy → drop the column in the *next* migration. (Django: `SeparateDatabaseAndState` removes it from the model without generating DROP COLUMN.)

### Large Data Migrations

```sql
-- BAD: one transaction updates all rows (locks table)
UPDATE users SET normalized_email = LOWER(email);

-- GOOD: batched with progress
DO $$
DECLARE
  batch_size INT := 10000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE users
    SET normalized_email = LOWER(email)
    WHERE id IN (
      SELECT id FROM users
      WHERE normalized_email IS NULL
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    );
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % rows', rows_updated;
    EXIT WHEN rows_updated = 0;
    COMMIT;
  END LOOP;
END $$;
```

## Tool Playbooks (dated 2026-07 — bind the active one via dev's stack-profile)

### Prisma (TypeScript/Node.js)

```bash
npx prisma migrate dev --name <name>     # create migration from schema changes (dev env)
npx prisma migrate deploy                # apply pending migrations — OPERATOR RUNS
npx prisma migrate dev --create-only --name <name>   # empty migration for custom SQL
npx prisma generate                      # regenerate client after schema changes
```

Custom SQL for what Prisma can't express (e.g. `CREATE INDEX CONCURRENTLY`): create-only, then edit the migration SQL manually.

### Drizzle (TypeScript/Node.js)

```bash
npx drizzle-kit generate    # generate migration from schema changes
npx drizzle-kit migrate     # apply — OPERATOR RUNS
npx drizzle-kit push        # direct push: DEV ONLY, never production
```

### Kysely (TypeScript/Node.js)

```bash
kysely migrate make <name>   # create migration file
kysely migrate latest        # apply all pending — OPERATOR RUNS
kysely migrate down          # rollback last — OPERATOR RUNS
kysely migrate list          # status
```

Migration files: always type `Kysely<any>`, never the current typed DB interface — migrations are frozen in time. Don't enable `allowUnorderedMigrations` outside development (schema-drift risk).

### Django (Python)

```bash
python manage.py makemigrations                       # generate from model changes
python manage.py migrate                              # apply — OPERATOR RUNS
python manage.py showmigrations                       # status
python manage.py makemigrations --empty <app> -n <desc>   # empty migration for custom SQL/data
```

Data migrations: `migrations.RunPython(forward, reverse)` with batched `bulk_update` (e.g. 5000/batch). `SeparateDatabaseAndState` decouples model-state changes from database operations.

### golang-migrate (Go)

```bash
migrate create -ext sql -dir migrations -seq <name>            # create up/down pair
migrate -path migrations -database "$DATABASE_URL" up          # apply — OPERATOR RUNS
migrate -path migrations -database "$DATABASE_URL" down 1      # rollback last — OPERATOR RUNS
migrate -path migrations -database "$DATABASE_URL" force VERSION   # fix dirty state — OPERATOR RUNS
```

Paired `.up.sql` / `.down.sql` files, sequentially numbered.

## Zero-Downtime Migration Strategy (expand-contract)

```
Phase 1: EXPAND   — add new column/table (nullable/default); app writes BOTH; backfill
Phase 2: MIGRATE  — app reads NEW, writes BOTH; verify consistency
Phase 3: CONTRACT — app uses NEW only; drop old in a separate migration
```

Timeline example: Day 1 add column + deploy dual-write → Day 2 backfill → Day 3 read-from-new deploy → Day 7 drop old column. Sequencing with deploys is co-owned with ops's `release-discipline`.

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
|-------------|-------------|-----------------|
| Manual SQL in production | No audit trail, unrepeatable | Always use migration files |
| Editing deployed migrations | Drift between environments | Create new migration instead |
| NOT NULL without default | Locks table, rewrites all rows | Nullable → backfill → constraint |
| Inline index on large table | Blocks writes during build | CREATE INDEX CONCURRENTLY |
| Schema + data in one migration | Hard to rollback, long transactions | Separate migrations |
| Dropping column before removing code | App errors on missing column | Remove code first, drop next deploy |
| *(VYON)* Agent executes a migration | Rail 3 violation — halt + escalate | dana authors, operator runs |

## Boundaries with other skills

- **migration-discipline (dana, custom):** the METHOD authority — reversibility, script + plain-language summary format, operator-execution protocol. This file supplies tool-specific mechanics only; any conflict resolves to migration-discipline.
- **data-modeling (dana):** decides *what* the schema should be; this file is *how the change is applied* safely.
- **db-performance (dana):** index decisions originate there; concurrent-build mechanics live here.
- **stack-profile (dev):** names which tool playbook is active per business; unlisted tools = method-only mode (Postgres patterns + expand-contract still apply).
- **release-discipline (ops):** expand-migrate-contract phases interleave with deploys — ops sequences, dana authors.
- **charter-enforcement (quinn):** Rail 3 scan verifies no agent-executed destructive op; migrations appear in locked plans as author-only steps.

## Boundaries & handoffs

- "Migrate / schema change / alter / backfill / data fix" → **migration-discipline** (dana writes, operator runs), which pulls tool-specific mechanics from **marketplace/database-migrations** (Postgres lock-safety, expand-contract, ORM playbooks — dated; the active tool comes from dev's stack-profile).

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dana\",\"skill\":\"database-migrations\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
