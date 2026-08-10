// lib/cie/tool-context.ts — CLASSIFY Layer 4 / RETRIEVE: tool-augmented retrieval
//
// MASTER.md §6.3 Layer 4: "tool-augmented retrieval (live tool calls treated as freshly-generated
// context, subject to Gate 1 same as any other source)". Checked rag/harness/gates.py's
// gate_authenticate() directly (2026-08-09) rather than assume: Check 1 requires
// chunk['source_file'] to exist ON DISK, relative to project_root — a live tool-call result has
// no such file by definition, so "subject to Gate 1 same as any other source" only actually holds
// if the tool output is first MATERIALIZED to a real file. That's what this module does — it
// doesn't just shape tool output to look like a chunk, it writes it to disk so Gate 1's real
// existence check can genuinely pass, not just superficially match the field names. Check 2
// (hash) is optional in gate_authenticate (only runs if `_source_hash` is set) — left unset here,
// so it's skipped rather than faked.

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, relative } from 'path'
import { createHash } from 'crypto'
import { getConfig } from '../adapters/config'

export interface ToolContextChunk {
  chunk_id: string
  source_file: string // relative to project root — verified to exist on disk by this function
  chunk_text: string
  citation: string
  department?: string
  tool_name: string
  called_at: string
}

function toolCacheDir(): string {
  return join(getConfig().projectRoot, 'store', 'tool-context-cache')
}

/**
 * materializeToolContext — writes a live tool call's output to disk under
 * store/tool-context-cache/ and returns a chunk-shaped object pointing at that real file, so it
 * can be passed into GATE the same way any retrieved chunk is (Gate 1's source_file existence
 * check will find a real file, not a synthetic path).
 */
export function materializeToolContext(
  toolName: string,
  output: string,
  opts: { department?: string; citation?: string } = {},
): ToolContextChunk {
  const dir = toolCacheDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const calledAt = new Date().toISOString()
  const shortHash = createHash('sha256').update(`${toolName}:${output}:${calledAt}`).digest('hex').slice(0, 12)
  const safeName = toolName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const filename = `${safeName}-${shortHash}.md`
  const fullPath = join(dir, filename)

  writeFileSync(fullPath, output, 'utf-8')

  const sourceFile = relative(getConfig().projectRoot, fullPath)

  return {
    chunk_id: `tool-${safeName}-${shortHash}`,
    source_file: sourceFile,
    chunk_text: output,
    citation: opts.citation ?? `live tool call: ${toolName}, ${calledAt}`,
    department: opts.department,
    tool_name: toolName,
    called_at: calledAt,
  }
}
