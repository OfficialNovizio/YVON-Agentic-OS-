import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('linkedin_connection')
    .select('person_id, person_name, person_headline, token_expiry, connected_at')
    .limit(1)
    .single()

  if (error || !data) {
    return Response.json({ connected: false })
  }

  const expired = data.token_expiry && new Date(data.token_expiry) < new Date()

  return Response.json({
    connected:       !expired,
    person_name:     data.person_name,
    person_headline: data.person_headline,
    connected_at:    data.connected_at,
    expired,
  })
}

export async function DELETE() {
  await supabase.from('linkedin_connection').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  return Response.json({ ok: true })
}
