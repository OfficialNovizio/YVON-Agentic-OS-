// prd-generator.ts — spec's PRD, generated for real (docs/PRD-prd-gated-task-
// conversion.md). Turns a chat discussion into the 7-section PRD (prd-
// discipline) + Working Agents + Context Refs, with a RICE score computed by
// the real scripts/rice.py — never hand-typed by the model.
//
// This is the piece MASTER.md §7.2 and PRD-task-detail-lifecycle-actions.md
// both flagged as never having run against a real request. It runs now, at
// the same two points chat already creates tasks from (create-task-spec.ts):
// the agent-offered accept flow and the /assignTask command.
//
// Contract with the model: the markdown body IS the PRD (rendered to the
// operator as-is); two fenced blocks carry the machine-readable parts,
// exactly the way stream/route.ts already parses a ```task-proposal block
// out of a normal reply — same convention, not a new one.
//
//   ```prd-meta
//   {"lead": "mia", "departments": ["Engineering"],
//    "decisions": ["...", "..."], "objective": "one testable sentence"}
//   ```
//   ```rice-inputs
//   {"reach": 100, "impact": 3, "confidence": 0.7, "effort": 2, "evidence_level": 1}
//   ```
//
// Owner: spec (Product) content, dev (Engineering) wiring — prd-gated-task-
// conversion, 2026-08-18

import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { callSynthesis } from '@/lib/ai-client'
import { errMsg } from '@/lib/errors'

const execFileAsync = promisify(execFile)
const REPO_ROOT = path.resolve(process.cwd(), '..')
const RICE_PY = path.join(REPO_ROOT, 'Teams', 'Product', 'spec', 'custom', 'backlog-rules', 'scripts', 'rice.py')

export interface PrdMeta {
  lead: string
  departments: string[]
  decisions: string[]
  objective: string
}

export interface RiceInputs {
  reach: number
  impact: number
  confidence: number
  effort: number
  evidence_level: number
}

export interface GeneratedPrd {
  /** Full markdown, including the appended RICE section — this is what gets
   * written to store/tasks/{id}-prd.md verbatim and rendered in chat. */
  markdown: string
  meta: PrdMeta
  riceInputs: RiceInputs
  riceScore: number
  riceCapped: boolean
  /** non-fatal notes about degraded parsing — shown honestly, never hidden */
  warnings: string[]
}

const SYSTEM_PROMPT = `You are spec, the Product department's lead and the Evidence Gate's
enforcement point (Teams/Product/spec/agent.md). A chat discussion between the
operator and the agent team has just been proposed as a real task. Your job,
per prd-discipline (Teams/Product/spec/custom/prd-discipline/SKILL.md), is to
turn that discussion into a real PRD — not a summary, not a to-do list.

Write the standard 7-section PRD, in this exact order, as markdown:
## 1. Problem
## 2. Evidence
## 3. Proposed Scope
## 4. Out of Scope
## 5. Success Metric
## 6. Acceptance Criteria
## 7. Risks + Rollback Stance

Then two more sections:
## Working Agents
Which agent(s) should own this (pick real agent ids — mia for frontend/Next.js,
raj for backend/API, dev for architecture/review, quinn for QA, spec/ux/loom/
metric/price for product work, or another real agent if the discussion clearly
names a different domain). Name a single lead.
## Context Refs
Anything already known that a working agent should cite instead of
re-deriving — existing files/modules the discussion mentioned, prior
decisions, or "none — no prior context to cite" if genuinely nothing applies.
Never invent a file path that wasn't in the discussion.

Rules (prd-discipline, non-negotiable):
- EVIDENCE cites the discussion itself: "operator directive, validation ladder
  L1" unless the discussion itself contains real research/data — do not
  invent evidence that wasn't discussed.
- OUT OF SCOPE is explicit and named, not an afterthought.
- SUCCESS METRIC is ONE metric. If no versioned metric definition exists yet,
  say so honestly (metric has not been asked) rather than inventing one.
- ACCEPTANCE CRITERIA are testable by a stranger — observable behavior, not
  implementation, with a falsifying case for each.
- Never fabricate reach/usage numbers you weren't given.

After the markdown, append exactly two fenced blocks and nothing else:

\`\`\`prd-meta
{"lead": "<agent id>", "departments": ["<dept>"], "decisions": ["<decision 1>", "<decision 2>"], "objective": "<one testable sentence for the primary work item>"}
\`\`\`

\`\`\`rice-inputs
{"reach": <number, people/period, estimate if uncited>, "impact": <0.25|0.5|1|2|3>, "confidence": <0..1>, "effort": <person-months, Engineering's estimate never yours>, "evidence_level": <1..5, validation ladder>}
\`\`\`

"decisions" in prd-meta should be 2-5 short strings capturing what discovery
would otherwise have asked as questions — they get written directly into the
task's discovery.decisions, so make them decisions, not questions.`

function extractFenced(text: string, tag: string): string | null {
  const re = new RegExp('```' + tag + '\\s*\\n([\\s\\S]*?)```', 'i')
  const m = text.match(re)
  return m ? m[1].trim() : null
}

function stripFenced(text: string): string {
  return text
    .replace(/```prd-meta[\s\S]*?```/i, '')
    .replace(/```rice-inputs[\s\S]*?```/i, '')
    .trim()
}

async function computeRice(inputs: RiceInputs): Promise<{ score: number; capped: boolean; error: string | null }> {
  const item = {
    id: 'CHAT-ITEM',
    title: 'chat-converted task',
    reach: inputs.reach,
    impact: inputs.impact,
    confidence: inputs.confidence,
    effort: inputs.effort,
    evidence_level: inputs.evidence_level,
  }
  const os = await import('os')
  const fs = await import('fs')
  const tmpFile = path.join(os.tmpdir(), `rice-items-${Date.now()}-${Math.random().toString(36).slice(2)}.json`)
  await fs.promises.writeFile(tmpFile, JSON.stringify([item]))
  try {
    const { stdout } = await execFileAsync('python3', [RICE_PY, tmpFile], { cwd: REPO_ROOT, timeout: 10_000 })
    const m = stdout.match(/rice=([\d.]+)\s+conf=([\d.]+)(\s+\(confidence CAPPED by evidence level\))?/)
    if (!m) return { score: 0, capped: false, error: `rice.py ran but output didn't match the expected format: ${stdout.slice(0, 200)}` }
    return { score: parseFloat(m[1]), capped: Boolean(m[3]), error: null }
  } catch (e) {
    return { score: 0, capped: false, error: errMsg(e) }
  } finally {
    await fs.promises.unlink(tmpFile).catch(() => {})
  }
}

export async function generatePrd(title: string, summary: string): Promise<GeneratedPrd> {
  const warnings: string[] = []

  const raw = await callSynthesis({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Title: ${title}\n\nDiscussion:\n${summary}` }],
    maxTokens: 3000,
  })

  const metaRaw = extractFenced(raw, 'prd-meta')
  const riceRaw = extractFenced(raw, 'rice-inputs')
  const markdownBody = stripFenced(raw)

  let meta: PrdMeta = { lead: 'dev', departments: [], decisions: [], objective: title.slice(0, 120) }
  if (metaRaw) {
    try {
      const parsed = JSON.parse(metaRaw) as Partial<PrdMeta>
      meta = {
        lead: (parsed.lead ?? 'dev').trim() || 'dev',
        departments: Array.isArray(parsed.departments) ? parsed.departments : [],
        decisions: Array.isArray(parsed.decisions) && parsed.decisions.length > 0
          ? parsed.decisions
          : [`Working agent: ${(parsed.lead ?? 'dev').trim() || 'dev'}`],
        objective: (parsed.objective ?? '').trim() || title.slice(0, 120),
      }
    } catch (e) {
      warnings.push(`prd-meta block was present but not valid JSON (${errMsg(e)}) — falling back to lead=dev, decisions derived from the title only.`)
    }
  } else {
    warnings.push('Model reply had no prd-meta block — falling back to lead=dev with a single decision derived from the title.')
  }

  let riceInputs: RiceInputs = { reach: 1, impact: 0.25, confidence: 0.5, effort: 1, evidence_level: 1 }
  if (riceRaw) {
    try {
      const parsed = JSON.parse(riceRaw) as Partial<RiceInputs>
      riceInputs = {
        reach: Number(parsed.reach) || 1,
        impact: Number(parsed.impact) || 0.25,
        confidence: Number(parsed.confidence) ?? 0.5,
        effort: Number(parsed.effort) || 1,
        evidence_level: Number(parsed.evidence_level) || 1,
      }
    } catch (e) {
      warnings.push(`rice-inputs block was present but not valid JSON (${errMsg(e)}) — using the most conservative rubric floor (reach=1, impact=0.25).`)
    }
  } else {
    warnings.push('Model reply had no rice-inputs block — using the most conservative rubric floor (reach=1, impact=0.25).')
  }

  const { score, capped, error: riceError } = await computeRice(riceInputs)
  if (riceError) warnings.push(`scripts/rice.py failed (${riceError}) — RICE score is 0, not a real ranking. Do not treat this task as prioritized against the backlog until this is re-run.`)

  // Bullets, not a markdown table — the chat Markdown renderer (Markdown.tsx)
  // deliberately supports only headings/paragraphs/bold/lists/links/quotes/
  // code, no tables; an unsupported construct still renders safely as plain
  // text per that file's own contract, but bullets actually render as a list.
  const confidenceUsed = capped ? Math.min(riceInputs.confidence, 0.5) : riceInputs.confidence
  const riceSection = [
    '',
    '## 8. RICE',
    '',
    '`[reasoning-based, not formula-verified]` — per backlog-rules rule 0.6, computed by the real `scripts/rice.py`, not hand-typed.',
    '',
    `- reach: ${riceInputs.reach}`,
    `- impact: ${riceInputs.impact}`,
    `- confidence: ${riceInputs.confidence}${capped ? ` (capped to ${confidenceUsed} by evidence_level=${riceInputs.evidence_level})` : ''}`,
    `- effort: ${riceInputs.effort}`,
    `- evidence_level: ${riceInputs.evidence_level}`,
    `- **score: ${score}**`,
    '',
  ].join('\n')

  const warningsSection = warnings.length > 0
    ? ['', '## Generation Notes (honest, not hidden)', '', ...warnings.map((w) => `- ${w}`), ''].join('\n')
    : ''

  return {
    markdown: `${markdownBody}\n${riceSection}${warningsSection}`,
    meta,
    riceInputs,
    riceScore: score,
    riceCapped: capped,
    warnings,
  }
}
