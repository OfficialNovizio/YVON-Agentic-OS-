import { appendDailyLog, getDailyLogs } from '@/lib/db'
import { cookies } from 'next/headers'
import { errMsg } from '@/lib/errors'

export async function GET(request: Request): Promise<Response> {
  const cookieStore = await cookies()
  const ventureId = cookieStore.get('yvon_active_venture')?.value ?? 'yvon-os'
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') ?? '7', 10)

  try {
    const logs = await getDailyLogs(ventureId, { days })
    return Response.json({ logs })
  } catch (err) {
    const msg = errMsg(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}

export async function POST(request: Request): Promise<Response> {
  const cookieStore = await cookies()
  const ventureId = cookieStore.get('yvon_active_venture')?.value ?? 'yvon-os'

  let body: {
    agentId?: string
    task?: string
    outcome?: string
    notes?: string
    logDate?: string
  }
  try {
    body = await request.json() as typeof body
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.agentId || !body.task) {
    return Response.json({ error: 'agentId and task are required' }, { status: 400 })
  }

  try {
    await appendDailyLog({
      ventureId,
      agentId: body.agentId,
      task: body.task,
      outcome: body.outcome,
      notes: body.notes,
      logDate: body.logDate ?? new Date().toISOString().split('T')[0],
    })
    return Response.json({ ok: true })
  } catch (err) {
    const msg = errMsg(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}
