import 'server-only'
import { supabase } from '@/lib/supabase'

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface Report {
  id:            string
  ventureId:     string
  reportType:    'analytics' | 'marketing' | 'competitor'
  periodStart:   string
  periodEnd:     string
  title:         string
  summary:       string
  data:          Record<string, unknown>
  anomalies:     Record<string, unknown> | null
  reportNumber:  number
  createdAt:     string
}

interface ReportRow {
  id:            string
  venture_id:    string
  report_type:   string
  period_start:  string
  period_end:    string
  title:         string
  summary:       string
  data:          Record<string, unknown>
  anomalies:     Record<string, unknown> | null
  report_number: number
  created_at:    string
}

function mapReport(r: ReportRow): Report {
  return {
    id: r.id,
    ventureId: r.venture_id,
    reportType: r.report_type as Report['reportType'],
    periodStart: r.period_start,
    periodEnd: r.period_end,
    title: r.title,
    summary: r.summary,
    data: r.data,
    anomalies: r.anomalies,
    reportNumber: r.report_number,
    createdAt: r.created_at,
  }
}

// ─── Create ─────────────────────────────────────────────────────────────────────

export async function insertReport(
  ventureId: string,
  reportType: Report['reportType'],
  periodStart: string,
  periodEnd: string,
  title: string,
  summary: string,
  data: Record<string, unknown>,
  anomalies?: Record<string, unknown> | null,
): Promise<Report> {
  const { data: row, error } = await supabase
    .from('reports')
    .insert({
      venture_id:   ventureId,
      report_type:  reportType,
      period_start: periodStart,
      period_end:   periodEnd,
      title,
      summary,
      data,
      anomalies: anomalies ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(`insertReport: ${error.message}`)
  return mapReport(row as ReportRow)
}

// ─── Query (latest per type) ────────────────────────────────────────────────────

export async function getLatestReport(
  ventureId: string,
  reportType: Report['reportType'],
): Promise<Report | null> {
  const { data } = await supabase
    .from('reports')
    .select('*')
    .eq('venture_id', ventureId)
    .eq('report_type', reportType)
    .order('created_at', { ascending: false })
    .limit(1)
  if (!data || data.length === 0) return null
  return mapReport(data[0] as ReportRow)
}

export async function getLatestReports(
  ventureId: string,
): Promise<{ analytics: Report | null; marketing: Report | null; competitor: Report | null }> {
  const [a, m, c] = await Promise.all([
    getLatestReport(ventureId, 'analytics'),
    getLatestReport(ventureId, 'marketing'),
    getLatestReport(ventureId, 'competitor'),
  ])
  return { analytics: a, marketing: m, competitor: c }
}

export async function getReportsByType(
  ventureId: string,
  reportType: Report['reportType'],
  limit = 10,
): Promise<Report[]> {
  const { data } = await supabase
    .from('reports')
    .select('*')
    .eq('venture_id', ventureId)
    .eq('report_type', reportType)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map((r) => mapReport(r as ReportRow))
}
