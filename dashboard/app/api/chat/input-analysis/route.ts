// POST /api/chat/input-analysis — Input Analysis stage (TS-027).
// Body: { content: string }
// Runs BEFORE the pipeline: classifies the tier and returns the analysis.
//   · generic → { tier: 'generic' } — the client replies directly, NO pipeline.
//   · info    → { tier: 'info', analysis } — light analysis, fast answer.
//   · build   → { tier: 'build', analysis } — full 5-field analysis; the client
//               injects [INPUT ANALYSIS] and proceeds through CAOS.
// Honest: /commands return generic (handled by the command layer); missing
// fields are "not specified"; LLM failure degrades to light analysis.
// Owner: raj · TS-027
import { analyzeMessage } from '@pipelines/input-analysis'

export async function POST(request: Request): Promise<Response> {
  let content = ''
  try {
    const body = (await request.json()) as { content?: string }
    content = (body.content ?? '').trim()
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }
  if (!content) {
    return Response.json({ error: 'content required' }, { status: 400 })
  }

  const analysis = await analyzeMessage(content)
  return Response.json(analysis)
}
