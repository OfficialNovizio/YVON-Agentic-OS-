// prd-pending.ts — holds a generated PRD between "shown in chat" and
// "operator said yes" (docs/PRD-prd-gated-task-conversion.md). A real file on
// disk, not in-memory/ephemeral state — matches this codebase's existing
// preference for disk-backed artifacts over passing large blobs through
// confirm-tokens or client state (create-task-spec.ts's own convention).
//
// store/tasks/.pending/ is deliberately NOT store/tasks/{id}-prd.md — nothing
// here is a real TASK-SPEC yet. A discarded proposal leaves no TS- record.
//
// Owner: dev · prd-gated-task-conversion, 2026-08-18

import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import type { GeneratedPrd } from '@/lib/prd-generator'

const REPO_ROOT = path.resolve(process.cwd(), '..')
const PENDING_DIR = path.join(REPO_ROOT, 'store', 'tasks', '.pending')

export interface PendingPrd {
  id: string
  title: string
  summary: string
  createdAt: string
  prd: GeneratedPrd
}

function pendingPath(id: string): string {
  // id is always our own randomUUID() output — never user input — but keep
  // the same discipline as the rest of this codebase anyway.
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error('invalid pending id')
  return path.join(PENDING_DIR, `${id}.json`)
}

export async function writePendingPrd(title: string, summary: string, prd: GeneratedPrd): Promise<string> {
  await fs.promises.mkdir(PENDING_DIR, { recursive: true })
  const id = randomUUID()
  const record: PendingPrd = { id, title, summary, createdAt: new Date().toISOString(), prd }
  await fs.promises.writeFile(pendingPath(id), JSON.stringify(record, null, 2))
  return id
}

export async function readPendingPrd(id: string): Promise<PendingPrd | null> {
  try {
    const text = await fs.promises.readFile(pendingPath(id), 'utf-8')
    return JSON.parse(text) as PendingPrd
  } catch {
    return null
  }
}

export async function discardPendingPrd(id: string): Promise<void> {
  await fs.promises.unlink(pendingPath(id)).catch(() => {})
}
