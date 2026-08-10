// GET /api/chat/context?agent=<id>&venture=<slug>
// Resolves the per-turn context (shared logic with the stream route via
// lib/context-resolver). Kept for external callers; the stream route inlines.
// Owner: raj + mia · TS-025/TS-028
import { agentContextFor, ventureContextFor } from '@/lib/context-resolver'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('agent')?.trim()
  const venture = (searchParams.get('venture')?.trim() || 'yvon-os').toLowerCase()

  const context: { agent?: string; venture?: string } = {}
  if (agentId) {
    const a = await agentContextFor(agentId)
    if (a) context.agent = a
  }
  const v = await ventureContextFor(venture)
  if (v) context.venture = v
  return Response.json(context)
}
