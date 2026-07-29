import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface PostRow {
  content: string
  tone: string
  impressions: number
  likes: number
  comments: number
  published_at: string | null
}

interface ContactRow {
  industry_tag: string | null
  relationship_strength: string | null
  created_at: string
}

interface AppRow {
  title: string
  company: string
  industry: string
  status: string
  match_score: number | null
  applied_at: string | null
  created_at: string
}

export async function GET() {
  const now = Date.now()
  const d30 = new Date(now - 30 * 86_400_000).toISOString()
  const d60 = new Date(now - 60 * 86_400_000).toISOString()

  // ── Content (linkedin_posts) ───────────────────────────────────────────────
  const [{ data: rawPosts30 }, { data: rawPostsAll }] = await Promise.all([
    supabase.from('linkedin_posts').select('impressions,likes,comments,published_at,tone,content').eq('status', 'published').gte('published_at', d30),
    supabase.from('linkedin_posts').select('impressions,likes,comments,published_at,tone,content').eq('status', 'published'),
  ])
  const { data: rawPosts60 } = await supabase.from('linkedin_posts').select('published_at').eq('status', 'published').gte('published_at', d60).lt('published_at', d30)

  const p30  = (rawPosts30  ?? []) as PostRow[]
  const pAll = (rawPostsAll ?? []) as PostRow[]

  const totalImpressions = pAll.reduce((s, p) => s + (p.impressions ?? 0), 0)
  const totalLikes       = pAll.reduce((s, p) => s + (p.likes       ?? 0), 0)
  const totalComments    = pAll.reduce((s, p) => s + (p.comments    ?? 0), 0)
  const engagementRate   = totalImpressions > 0
    ? Math.round(((totalLikes + totalComments) / totalImpressions) * 1000) / 10
    : 0

  // Weekly bars — last 8 weeks (W1 oldest → W8 current)
  const weeklyPosts = Array.from({ length: 8 }, (_, i) => {
    const w     = 7 - i
    const start = new Date(now - (w + 1) * 7 * 86_400_000)
    const end   = new Date(now -  w      * 7 * 86_400_000)
    return {
      week:  `W${i + 1}`,
      count: pAll.filter(p => {
        if (!p.published_at) return false
        const d = new Date(p.published_at)
        return d >= start && d < end
      }).length,
    }
  })

  // Tone breakdown
  const toneMap: Record<string, { count: number; impressions: number }> = {}
  for (const p of pAll) {
    const t = p.tone ?? 'unknown'
    if (!toneMap[t]) toneMap[t] = { count: 0, impressions: 0 }
    toneMap[t].count++
    toneMap[t].impressions += p.impressions ?? 0
  }
  const toneBreakdown = Object.entries(toneMap)
    .map(([tone, d]) => ({ tone, ...d }))
    .sort((a, b) => b.impressions - a.impressions)

  const topPosts = [...pAll]
    .sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0))
    .slice(0, 3)

  const postsLast30d = p30.length
  const postsLast60d = (rawPosts60 ?? []).length
  const weeksActive  = weeklyPosts.filter(w => w.count > 0).length

  const momentumScore = postsLast30d >= postsLast60d
    ? Math.min(postsLast30d * 2, 10)
    : Math.max(0, 5 - (postsLast60d - postsLast30d) * 2)
  const consistScore  = Math.round((weeksActive / 8) * 13)
  const engScore      = Math.min(Math.round(engagementRate * 2), 10)
  const contentScore  = momentumScore + consistScore + engScore

  // ── Network (network_contacts + contact_interactions) ─────────────────────
  const [{ data: rawContacts }, { data: rawNew30 }, { data: rawActs30 }] = await Promise.all([
    supabase.from('network_contacts').select('industry_tag,relationship_strength,created_at'),
    supabase.from('network_contacts').select('id').gte('created_at', d30),
    supabase.from('contact_interactions').select('id').gte('created_at', d30),
  ])
  const { data: rawNew60 } = await supabase.from('network_contacts').select('id').gte('created_at', d60).lt('created_at', d30)

  const contacts        = (rawContacts ?? []) as ContactRow[]
  const totalContacts   = contacts.length
  const contactsLast30d = (rawNew30 ?? []).length
  const contactsLast60d = (rawNew60 ?? []).length
  const interactionsLast30d = (rawActs30 ?? []).length
  const strongContacts  = contacts.filter(c => c.relationship_strength === 'strong').length
  const industrySet     = new Set(contacts.map(c => c.industry_tag).filter(Boolean))

  const contactQtyScore = Math.min(Math.round((totalContacts / 50) * 10), 10)
  const netGrowthScore  = contactsLast30d >= contactsLast60d
    ? Math.min(contactsLast30d * 2, 10)
    : Math.max(0, 5 - (contactsLast60d - contactsLast30d))
  const activityScore   = Math.min(interactionsLast30d * 2, 8)
  const diversityScore  = Math.min(industrySet.size, 5)
  const networkScore    = contactQtyScore + netGrowthScore + activityScore + diversityScore

  // ── Pipeline (job_applications) ───────────────────────────────────────────
  const { data: rawApps } = await supabase.from('job_applications').select('title,company,industry,status,match_score,applied_at,created_at').order('created_at', { ascending: false })
  const { data: rawApps60 } = await supabase.from('job_applications').select('id').gte('created_at', d60).lt('created_at', d30)

  const apps        = (rawApps ?? []) as AppRow[]
  const appsLast30d = apps.filter(a => a.created_at >= d30).length
  const appsLast60d = (rawApps60 ?? []).length

  const statusCounts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {})

  const matchScores   = apps.filter(a => a.match_score != null).map(a => a.match_score as number)
  const avgMatchScore = matchScores.length > 0
    ? Math.round(matchScores.reduce((s, n) => s + n, 0) / matchScores.length)
    : 0

  const indMap: Record<string, number> = {}
  for (const a of apps) { indMap[a.industry] = (indMap[a.industry] ?? 0) + 1 }
  const industryBreakdown = Object.entries(indMap)
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count)

  const recentApps = apps.slice(0, 5).map(a => ({
    title: a.title, company: a.company, industry: a.industry,
    status: a.status, applied_at: a.applied_at,
  }))

  const interviewCount  = (statusCounts['interview'] ?? 0) + (statusCounts['offer'] ?? 0)
  const appliedCount    = statusCounts['applied'] ?? 0
  const appVolumeScore  = Math.min(Math.round(appsLast30d * 1.5), 12)
  const stageScore      = Math.min(interviewCount * 3 + Math.round(appliedCount * 1.5), 12)
  const matchQualScore  = Math.round((avgMatchScore / 100) * 10)
  const pipelineScore   = appVolumeScore + stageScore + matchQualScore

  const overallScore = Math.min(contentScore + networkScore + pipelineScore, 100)

  return Response.json({
    content: {
      postsLast30d, postsLast60d, totalImpressions, totalLikes, totalComments,
      engagementRate, weeklyPosts, toneBreakdown, topPosts, score: contentScore,
    },
    network: {
      totalContacts, contactsLast30d, contactsLast60d,
      interactionsLast30d, strongContacts, industryCount: industrySet.size,
      score: networkScore,
    },
    pipeline: {
      total: apps.length,
      saved:      statusCounts['saved']      ?? 0,
      applied:    statusCounts['applied']    ?? 0,
      interview:  statusCounts['interview']  ?? 0,
      offer:      statusCounts['offer']      ?? 0,
      closed:     statusCounts['closed']     ?? 0,
      appsLast30d, appsLast60d, avgMatchScore,
      industryBreakdown, recentApps, score: pipelineScore,
    },
    overallScore,
    computedAt: new Date().toISOString(),
  })
}
