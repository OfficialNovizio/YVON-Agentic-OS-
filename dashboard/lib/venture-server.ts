import 'server-only'
import { getVentureConfig } from '@/lib/venture-context'
import { getVentureBySlug } from '@/lib/db'
import type { VentureConfig } from '@/lib/types'

// Async DB version — for server-side route handlers and server components.
// Falls back to env-var defaults if DB is unreachable or returns nothing.

export async function getVentureFromDB(slug: string): Promise<VentureConfig> {
  try {
    const venture = await getVentureBySlug(slug)
    if (venture) return venture
  } catch {
    // DB unreachable — fall through to env-var fallback
  }
  return getVentureConfig(slug)
}
