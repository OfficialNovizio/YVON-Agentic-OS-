import { NextRequest } from 'next/server'
import { supabase }    from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contact_id = searchParams.get('contact_id')

  let query = supabase
    .from('contact_interactions')
    .select('*, network_contacts(name, title, company, industry_tag)')
    .order('interaction_date', { ascending: false })
    .order('created_at',      { ascending: false })

  if (contact_id) query = query.eq('contact_id', contact_id)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ interactions: data })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.contact_id) return Response.json({ error: 'contact_id is required' }, { status: 400 })

  const interactionDate = (body.interaction_date as string) ?? new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('contact_interactions')
    .insert({
      contact_id:       body.contact_id,
      interaction_date: interactionDate,
      type:             body.type    ?? 'other',
      notes:            body.notes   ?? null,
      outcome:          body.outcome ?? null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Auto-update contact's last_contacted if this interaction is the most recent
  await supabase
    .from('network_contacts')
    .update({ last_contacted: interactionDate })
    .eq('id', body.contact_id as string)
    .lt('last_contacted', interactionDate)
    // Also update if last_contacted is null
  try {
    await supabase.rpc('update_last_contacted_if_newer', {
      p_contact_id: body.contact_id,
      p_date:       interactionDate,
    })
  } catch { /* best-effort — fallback below */ }

  // Fallback: always update last_contacted to max(current, new_date)
  const { data: contact } = await supabase
    .from('network_contacts').select('last_contacted').eq('id', body.contact_id as string).single()
  if (contact && (!contact.last_contacted || contact.last_contacted < interactionDate)) {
    await supabase
      .from('network_contacts')
      .update({ last_contacted: interactionDate })
      .eq('id', body.contact_id as string)
  }

  return Response.json({ interaction: data }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase.from('contact_interactions').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
