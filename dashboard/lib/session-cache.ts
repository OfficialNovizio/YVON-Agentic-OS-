/**
 * lib/session-cache.ts
 * Simple in-memory cache that survives tab switches and route navigations.
 * Clears on page refresh (by design — we want fresh data on hard reload).
 *
 * Usage:
 *   const { data, loading, refresh } = useSessionCache(
 *     'competitor-intel-novizio',
 *     () => fetch('/api/competitor-intelligence?venture=novizio').then(r => r.json())
 *   )
 */

const cache = new Map<string, { data: unknown; fetchedAt: number }>()

interface UseSessionCacheResult<T> {
  data: T | null
  loading: boolean
  stale: boolean
  refresh: () => Promise<void>
  clear: () => void
}

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  return entry.data as T
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, fetchedAt: Date.now() })
}

export function clearCache(key?: string): void {
  if (key) cache.delete(key)
  else cache.clear()
}

export function isStale(key: string, maxAgeMs: number = 5 * 60 * 1000): boolean {
  const entry = cache.get(key)
  if (!entry) return true
  return Date.now() - entry.fetchedAt > maxAgeMs
}

// React hook for components
export function createSessionLoader<T>(key: string, fetcher: () => Promise<T>) {
  return {
    load: async (): Promise<T> => {
      const cached = getCached<T>(key)
      if (cached !== null) return cached
      const data = await fetcher()
      setCache(key, data)
      return data
    },
    get: (): T | null => getCached<T>(key),
    clear: (): void => clearCache(key),
  }
}
