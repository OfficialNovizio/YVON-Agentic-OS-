/**
 * lib/ventures.ts — Shared venture registry helpers.
 *
 * Single source of truth for per-venture tech-stack metadata.
 * Import from here instead of duplicating the constant in every route file.
 */

// TS-026: no hardcoded sub-brand stacks. The only static entry is the system
// venture; real ventures' stacks come from the DB (ventures.repo_url) when
// available, else a generic default.
export const VENTURE_TECH_STACK: Record<string, string> = {
  'yvon-os': 'Next.js AI operating system (TypeScript, Supabase)',
}

export function getVentureTechStack(ventureSlug: string | undefined): string {
  if (ventureSlug && ventureSlug !== 'yvon-os') return 'web/mobile app'
  return VENTURE_TECH_STACK[ventureSlug ?? ''] ?? 'web/mobile app'
}

export function isFlutterVenture(ventureSlug: string | undefined, githubSnapshot?: string, message?: string): boolean {
  const stack = getVentureTechStack(ventureSlug)
  return stack.includes('Flutter') ||
    (!!githubSnapshot && /pubspec\.yaml/i.test(githubSnapshot)) ||
    (!!message && /\b(flutter|\.dart)\b/i.test(message))
}
