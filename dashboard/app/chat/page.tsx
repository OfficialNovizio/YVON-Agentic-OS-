// /chat — placeholder while Push C (router + real UI) is in flight.
// The route exists so login redirects have a target and the sidebar item works.
// Auth-gated by middleware (Supabase session required).
// Owner: mia · TS-009 (Push B placeholder → replaced by Push C WI-3)
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { PageHeader, Card } from '@/components/ui'
import { MessageSquare } from 'lucide-react'

export default async function ChatPlaceholderPage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/chat')

  // Look up profile role for display
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role, display_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Chat"
        subtitle="Talk to your team of agents."
      />

      <Card className="p-8">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-on-surface">You&rsquo;re signed in</h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-on-surface-variant">
          <strong className="text-on-surface">{String(profile?.email ?? user.email ?? '')}</strong>
          {' · '}
          role: <span className="font-mono">{String(profile?.role ?? 'bod_member')}</span>
        </p>

        <div className="mt-6 border-t border-white/[0.06] pt-6">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
            Coming next
          </div>
          <p className="max-w-lg text-[13px] leading-relaxed text-on-surface-variant">
            The chat surface (rooms, message stream, @mention autocomplete, streaming agent
            responses via the workflow router) ships in <span className="font-mono">TS-009 Push C</span>.
            Auth foundation + Supabase schema (this push) is what enables it.
          </p>
        </div>
      </Card>
    </div>
  )
}
