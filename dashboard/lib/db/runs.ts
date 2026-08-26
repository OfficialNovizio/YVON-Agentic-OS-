// runs.ts — the run-record store (2026-08-24, TS-045).
//
// A suite's verdict lives in a run record: store/runs/run-<n>.md, written by
// the verifier and referenced by the task's run_ref. The record replaces prose
// exit proofs — a criterion and an assertion are the same line, and the proof
// IS the run (cli/task.py suite --run <path>).
//
// This module owns the read side for anything that wants to show a run. It is
// deliberately small: the records are markdown files on disk (same repo the
// dashboard runs from — see the KNOWN GAP in lib/create-task-spec.ts for the
// Vercel constraint), and parsing stays regex-light like cli/task.py.
//
// Owner: dev · task-surface v4, 2026-08-24

import fs from 'fs'
import path from 'path'

const REPO_ROOT = path.resolve(process.cwd(), '..')
const RUNS_DIR = path.join(REPO_ROOT, 'store', 'runs')

export interface RunCriterion {
  verdict: 'pass' | 'fail' | 'deferred' | 'not_run'
  text: string
}

export interface RunRecord {
  id: string
  taskId: string
  suite: string
  result: string
  date: string
  criteria: RunCriterion[]
  raw: string
}

/** Read a run record by id ("run-2617") or by its file path. undefined when
 *  absent — never invented, never a synthesized default. */
export function readRunRecord(ref: string): RunRecord | undefined {
  const clean = ref.replace(/^store\/runs\//, '').replace(/\.md$/, '')
  if (!/^run-\d+$/.test(clean)) return undefined
  const p = path.join(RUNS_DIR, `${clean}.md`)
  if (!fs.existsSync(p)) return undefined
  const raw = fs.readFileSync(p, 'utf-8')

  const taskId = /^- task:\s*(\S+)/m.exec(raw)?.[1] ?? ''
  const suite = /^- suite:\s*(.+)$/m.exec(raw)?.[1] ?? ''
  const result = /^- result:\s*(.+)$/m.exec(raw)?.[1] ?? ''
  const date = /^- date:\s*(\S+)/m.exec(raw)?.[1] ?? ''

  const criteria: RunCriterion[] = []
  const re = /^  - \[(pass|fail|deferred|not_run)\]\s+(.+)$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    criteria.push({ verdict: m[1] as RunCriterion['verdict'], text: m[2].trim() })
  }

  return { id: clean, taskId, suite, result, date, criteria, raw }
}
