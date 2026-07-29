import { createClient } from '@supabase/supabase-js'
import { callSynthesis } from '@/lib/ai-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface ContactRow { id: string; name: string; company: string | null; next_action: string | null; next_action_date: string; last_contacted: string | null }
interface AppRow     { title: string; company: string; status: string }
interface PostRow    { scheduled_date: string | null; status: string }

export async function POST() {
  const today        = new Date().toISOString().slice(0, 10)
  const todayDate    = new Date(); todayDate.setHours(0, 0, 0, 0)
  const nextWeek     = new Date(todayDate); nextWeek.setDate(nextWeek.getDate() + 7)
  const ago14        = new Date(todayDate); ago14.setDate(ago14.getDate() - 14)
  const ago30        = new Date(todayDate); ago30.setDate(ago30.getDate() - 30)

  // Fetch context in parallel
  const [{ data: rawContacts }, { data: rawApps }, { data: rawPosts }] = await Promise.all([
    supabase.from('network_contacts').select('id,name,company,next_action,next_action_date,last_contacted').not('next_action_date', 'is', null),
    supabase.from('job_applications').select('title,company,status').in('status', ['interview', 'offer', 'applied', 'followed_up']),
    supabase.from('linkedin_posts').select('scheduled_date,status').eq('status', 'scheduled'),
  ])

  const contacts  = (rawContacts ?? []) as ContactRow[]
  const apps      = (rawApps     ?? []) as AppRow[]
  const posts     = (rawPosts    ?? []) as PostRow[]

  const overdue      = contacts.filter(c => new Date(c.next_action_date) < todayDate)
  const dueThisWeek  = contacts.filter(c => { const d = new Date(c.next_action_date); return d >= todayDate && d <= nextWeek })
  const interviews   = apps.filter(a => a.status === 'interview' || a.status === 'offer')
  const applied      = apps.filter(a => a.status === 'applied' || a.status === 'followed_up')

  // Contacts going cold (last_contacted 14–30 days ago)
  const goingCold = contacts.filter(c => {
    if (!c.last_contacted) return false
    const d = new Date(c.last_contacted)
    return d < ago14 && d >= ago30
  })

  // Scheduled posts this week
  const scheduledThisWeek = posts.filter(p => {
    if (!p.scheduled_date) return false
    const d = new Date(p.scheduled_date)
    return d >= todayDate && d <= nextWeek
  }).length

  // Stats for the UI strip
  const stats = {
    overdue_followups:       overdue.length,
    active_interviews:       interviews.length,
    posts_this_week:         scheduledThisWeek,
    contacts_going_cold:     goingCold.length,
  }

  // Build prompt context
  const overdueLines      = overdue.slice(0, 5).map(c => `  - ${c.name}${c.company ? ` (${c.company})` : ''}: "${c.next_action ?? 'follow up'}" — overdue`).join('\n')
  const thisWeekLines     = dueThisWeek.slice(0, 5).map(c => `  - ${c.name}: "${c.next_action ?? 'follow up'}" — due by ${c.next_action_date}`).join('\n')
  const interviewLines    = interviews.map(a => `  - ${a.title} at ${a.company} (${a.status})`).join('\n')
  const appliedLines      = applied.slice(0, 5).map(a => `  - ${a.title} at ${a.company} — awaiting response`).join('\n')

  const prompt = `Today is ${today}. You are the personal AI assistant for a Canadian professional.

Background:
- Aircraft Engineering degree + 2 years SW dev at a trucking/dispatch company + MBA
- Building Novizio (sustainable fashion e-commerce) and Hourbour (fintech SaaS for dispatch operations)
- Actively job hunting in Aerospace, IT, and Drone sectors

Current state:
NETWORK:
- Overdue follow-ups (${overdue.length}):
${overdueLines || '  None'}
- Due this week (${dueThisWeek.length}):
${thisWeekLines || '  None'}
- Contacts going cold: ${goingCold.length}

CAREER:
- Active interviews/offers (${interviews.length}):
${interviewLines || '  None'}
- Applications awaiting response (${applied.length}):
${appliedLines || '  None'}

CONTENT:
- Scheduled posts this week: ${scheduledThisWeek}

Generate exactly 3 specific, high-impact actions for today. Priority order: overdue > time-sensitive > opportunity.

Rules:
- Be concrete and specific — use real names, companies, and context from the data above
- Each action must be achievable in under 30 minutes
- Do NOT invent information not in the data — if there's nothing overdue, focus on career or content
- Use the exact names and companies from the data

Return ONLY this JSON (no markdown):
{
  "actions": [
    { "priority": 1, "category": "network", "action": "Specific action", "reason": "Why this matters today (1 sentence)", "urgency": "high" },
    { "priority": 2, "category": "career|content|venture|network|other", "action": "...", "reason": "...", "urgency": "medium" },
    { "priority": 3, "category": "...", "action": "...", "reason": "...", "urgency": "low" }
  ],
  "context_summary": "One sentence summarizing today's most important situation"
}`

  try {
    const raw     = await callSynthesis({ messages: [{ role: 'user', content: prompt }], maxTokens: 800 })
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed  = JSON.parse(cleaned)
    return Response.json({ ...parsed, stats, generated_at: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Generation failed' }, { status: 500 })
  }
}
