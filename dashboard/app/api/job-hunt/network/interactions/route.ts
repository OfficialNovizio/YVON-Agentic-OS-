/**
 * /api/job-hunt/network/interactions — logs a touchpoint with a contact and
 * bumps their last_contacted date. Ported from the operator's own YVON-OS
 * app/api/network/interactions/route.ts (2026-08-15) — simplified the
 * last_contacted bump to a single select-then-conditional-update (the
 * original had a dead RPC call to a function that was never defined,
 * wrapped in a swallowed try/catch — same net effect, cleaner code).
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contactId = searchParams.get('contact_id')

  try {
    const sb = getServiceClient()
    let query = sb
      .from('contact_interactions')
      .select('*, network_contacts(name, title, company, industry_tag)')
      .order('interaction_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (contactId) query = query.eq('contact_id', contactId)

    const { data, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ interactions: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.contact_id) return Response.json({ error: 'contact_id is required' }, { status: 400 })

  const interactionDate = (body.interaction_date as string) ?? new Date().toISOString().slice(0, 10)
  const contactId = body.contact_id as string

  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('contact_interactions')
      .insert({
        contact_id: contactId,
        interaction_date: interactionDate,
        type: body.type ?? 'other',
        notes: body.notes ?? null,
        outcome: body.outcome ?? null,
      })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Bump last_contacted only if this interaction is newer than what's on file.
    const { data: contact } = await sb.from('network_contacts').select('last_contacted').eq('id', contactId).single()
    if (contact && (!contact.last_contacted || contact.last_contacted < interactionDate)) {
      await sb.from('network_contacts').update({ last_contacted: interactionDate }).eq('id', contactId)
    }

    return Response.json({ interaction: data }, { status: 201 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { error } = await sb.from('contact_interactions').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
