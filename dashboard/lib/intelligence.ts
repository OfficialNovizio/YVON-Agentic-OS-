import 'server-only'
import { supabase } from '@/lib/supabase'
import type { Report } from '@/lib/reports'

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface IntelligenceBatch {
  id:            string
  ventureId:     string
  batchNumber:   number
  analyticsId:   string | null
  marketingId:   string | null
  competitorId:  string | null
  status:        'generating' | 'complete' | 'failed'
  createdAt:     string
}

export interface ContentPitch {
  id:                  string
  ventureId:           string
  batchId:             string | null
  rank:                number
  platform:            string
  format:              string
  category:            'competitor_gap' | 'unclaimed_territory' | 'blue_ocean'
  intelligenceSource:  string | null
  ourMove:             string
  hookA:               string
  hookB:               string
  leverPrimary:        string
  leverA:              string
  leverB:              string
  psychologyScore:     number | null
  system1ScoreA:       number | null
  system1ScoreB:       number | null
  runRecommendation:   string | null
  marketEffect:        string | null
  vsCurrent:           string | null
  viralMechanism:      string | null
  fullProposal:        Record<string, unknown> | null
  status:              'pending' | 'approved' | 'drafted' | 'deployed' | 'passed'
  strategyLogId:       string | null
  generatedAt:         string
}

interface IntelBatchRow {
  id:             string
  venture_id:     string
  batch_number:   number
  analytics_id:   string | null
  marketing_id:   string | null
  competitor_id:  string | null
  status:         string
  created_at:     string
}

interface PitchRow {
  id:                   string
  venture_id:           string
  batch_id:             string | null
  rank:                 number
  platform:             string
  format:               string
  category:             string
  intelligence_source:  string | null
  our_move:             string
  hook_a:               string
  hook_b:               string
  lever_primary:        string
  lever_a:              string
  lever_b:              string
  psychology_score:     number | null
  system1_score_a:      number | null
  system1_score_b:      number | null
  run_recommendation:   string | null
  market_effect:        string | null
  vs_current:           string | null
  viral_mechanism:      string | null
  full_proposal:        Record<string, unknown> | null
  status:               string
  strategy_log_id:      string | null
  generated_at:         string
}

function mapBatch(r: IntelBatchRow): IntelligenceBatch {
  return {
    id: r.id,
    ventureId: r.venture_id,
    batchNumber: r.batch_number,
    analyticsId: r.analytics_id,
    marketingId: r.marketing_id,
    competitorId: r.competitor_id,
    status: r.status as IntelligenceBatch['status'],
    createdAt: r.created_at,
  }
}

function mapPitch(r: PitchRow): ContentPitch {
  return {
    id: r.id,
    ventureId: r.venture_id,
    batchId: r.batch_id,
    rank: r.rank,
    platform: r.platform,
    format: r.format,
    category: r.category as ContentPitch['category'],
    intelligenceSource: r.intelligence_source,
    ourMove: r.our_move,
    hookA: r.hook_a,
    hookB: r.hook_b,
    leverPrimary: r.lever_primary,
    leverA: r.lever_a,
    leverB: r.lever_b,
    psychologyScore: r.psychology_score,
    system1ScoreA: r.system1_score_a,
    system1ScoreB: r.system1_score_b,
    runRecommendation: r.run_recommendation,
    marketEffect: r.market_effect,
    vsCurrent: r.vs_current,
    viralMechanism: r.viral_mechanism,
    fullProposal: r.full_proposal,
    status: r.status as ContentPitch['status'],
    strategyLogId: r.strategy_log_id,
    generatedAt: r.generated_at,
  }
}

// ─── Intelligence Batches ───────────────────────────────────────────────────────

export async function createBatch(
  ventureId: string,
  analyticsId: string | null,
  marketingId: string | null,
  competitorId: string | null,
): Promise<IntelligenceBatch> {
  // Get next batch number
  const { data: last } = await supabase
    .from('intelligence_batches')
    .select('batch_number')
    .eq('venture_id', ventureId)
    .order('batch_number', { ascending: false })
    .limit(1)

  const nextNum = (last && last.length > 0 ? last[0].batch_number : 0) + 1

  const { data, error } = await supabase
    .from('intelligence_batches')
    .insert({
      venture_id:    ventureId,
      batch_number:  nextNum,
      analytics_id:  analyticsId,
      marketing_id:  marketingId,
      competitor_id: competitorId,
      status:        'generating',
    })
    .select()
    .single()
  if (error) throw new Error(`createBatch: ${error.message}`)
  return mapBatch(data as IntelBatchRow)
}

export async function updateBatchStatus(
  batchId: string,
  status: IntelligenceBatch['status'],
): Promise<void> {
  const { error } = await supabase
    .from('intelligence_batches')
    .update({ status })
    .eq('id', batchId)
  if (error) throw new Error(`updateBatchStatus: ${error.message}`)
}

export async function getLatestBatch(ventureId: string): Promise<IntelligenceBatch | null> {
  const { data } = await supabase
    .from('intelligence_batches')
    .select('*')
    .eq('venture_id', ventureId)
    .order('created_at', { ascending: false })
    .limit(1)
  if (!data || data.length === 0) return null
  return mapBatch(data[0] as IntelBatchRow)
}

export async function getBatchHistory(
  ventureId: string,
  limit = 10,
): Promise<IntelligenceBatch[]> {
  const { data } = await supabase
    .from('intelligence_batches')
    .select('*')
    .eq('venture_id', ventureId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map((r) => mapBatch(r as IntelBatchRow))
}

// ─── Content Pitches ────────────────────────────────────────────────────────────

export async function insertPitches(
  pitches: Array<Record<string, unknown>>,
): Promise<void> {
  if (pitches.length === 0) return
  const { error } = await supabase.from('content_pitches').insert(
    pitches.map((p) => ({
      venture_id:          p.ventureId,
      batch_id:            p.batchId,
      rank:                p.rank,
      platform:            p.platform,
      format:              p.format,
      category:            p.category,
      intelligence_source: p.intelligenceSource,
      our_move:            p.ourMove,
      hook_a:              p.hookA,
      hook_b:              p.hookB,
      lever_primary:       p.leverPrimary,
      lever_a:             p.leverA,
      lever_b:             p.leverB,
      psychology_score:    p.psychologyScore,
      system1_score_a:     p.system1ScoreA,
      system1_score_b:     p.system1ScoreB,
      run_recommendation:  p.runRecommendation,
      market_effect:       p.marketEffect,
      vs_current:          p.vsCurrent,
      viral_mechanism:     p.viralMechanism,
      full_proposal:       p.fullProposal,
      status:              p.status,
      strategy_log_id:     p.strategyLogId,
    })),
  )
  if (error) throw new Error(`insertPitches: ${error.message}`)
}

export async function getPitchesByBatch(
  batchId: string,
): Promise<ContentPitch[]> {
  const { data } = await supabase
    .from('content_pitches')
    .select('*')
    .eq('batch_id', batchId)
    .order('rank', { ascending: true })
  return (data ?? []).map((r) => mapPitch(r as PitchRow))
}

export async function getLatestPitches(
  ventureId: string,
  limit = 5,
): Promise<ContentPitch[]> {
  const batch = await getLatestBatch(ventureId)
  if (!batch) return []
  return getPitchesByBatch(batch.id)
}

export async function updatePitchStatus(
  pitchId: string,
  status: ContentPitch['status'],
): Promise<void> {
  const { error } = await supabase
    .from('content_pitches')
    .update({ status })
    .eq('id', pitchId)
  if (error) throw new Error(`updatePitchStatus: ${error.message}`)
}

// ─── Lever Tracker ──────────────────────────────────────────────────────────────

export interface LeverTrackerRow {
  brand:       string
  surface:     string
  lever:       string
  usageCount:  number
  capped:      boolean
  history:     string[]
  lastUsed:    string
}

export async function getLeverTracker(brand: string): Promise<LeverTrackerRow[]> {
  const { data } = await supabase
    .from('lever_tracker')
    .select('*')
    .eq('brand', brand)
  return (data ?? []).map((r) => ({
    brand:      r.brand,
    surface:    r.surface,
    lever:      r.lever,
    usageCount: r.usage_count,
    capped:     r.capped,
    history:    (r.history as string[]) ?? [],
    lastUsed:   r.last_used,
  }))
}

export async function updateLeverTracker(
  brand: string,
  surface: string,
  lever: string,
): Promise<void> {
  const { data: existing } = await supabase
    .from('lever_tracker')
    .select('*')
    .eq('brand', brand)
    .eq('surface', surface)
    .single()

  if (existing) {
    const currentHistory: string[] = (existing.history as string[]) ?? []
    const sameLever = existing.lever === lever
    const newCount = sameLever
      ? Math.min((existing.usage_count ?? 0) + 1, 3)
      : 1
    const newHistory = sameLever
      ? currentHistory
      : [...currentHistory, existing.lever].slice(-3)

    await supabase
      .from('lever_tracker')
      .update({
        lever:        lever,
        usage_count:  newCount,
        capped:       newCount >= 3,
        history:      newHistory,
        last_used:    new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('lever_tracker')
      .insert({
        brand,
        surface,
        lever,
        usage_count: 1,
        capped:      false,
        history:     [],
      })
  }
}

// ─── Strategy Log ───────────────────────────────────────────────────────────────

export async function insertStrategyLog(
  brand: string,
  surface: string,
  lever: string,
  layerNumber: number,
  variantA: string,
  variantB: string,
  runRecommendation: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('strategy_log')
    .insert({
      brand,
      surface,
      lever,
      layer_number: layerNumber,
      variant_a:    variantA,
      variant_b:    variantB,
      run_recommendation: runRecommendation,
    })
    .select()
    .single()
  if (error) throw new Error(`insertStrategyLog: ${error.message}`)
  return data.id
}
