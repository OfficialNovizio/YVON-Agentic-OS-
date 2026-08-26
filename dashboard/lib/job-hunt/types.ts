// Shared shapes for the Job Hunt discovery module (2026-08-15).

export interface NormalizedJob {
  source: string
  external_id: string
  title: string
  company: string
  location: string | null
  remote: boolean | null
  url: string
  description: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  posted_at: string | null // ISO 8601
  raw: unknown
}

export interface SourceSearchOptions {
  query: string
  location?: string
  limit?: number
  /** Per-source credentials, e.g. { app_id, app_key } for Adzuna. */
  config?: Record<string, unknown>
  /** Industry tag driving Adzuna's category+keyword mapping (Aerospace/IT/Trucking/Drone/Business). */
  industry?: string
  /** Canadian province code (ON/BC/AB/QC/MB/SK/...) driving Adzuna's location mapping. */
  province?: string
  /** Pagination page (1-based) — deep pulls page through history (2026-08-25). */
  page?: number
}

export interface JobSource {
  id: string
  label: string
  needsKey: boolean
  search(opts: SourceSearchOptions): Promise<NormalizedJob[]>
}
