// Temporary type shim for @supabase/ssr so tsc passes before `npm install`.
// When the real package is installed (dashboard/node_modules/@supabase/ssr),
// TypeScript uses its bundled types automatically — this shim is dormant.
//
// Safe to delete once the dep has been installed everywhere.
// TS-009 Push B.

declare module '@supabase/ssr' {
  export type CookieOptions = {
    domain?: string
    path?: string
    maxAge?: number
    expires?: Date
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none' | boolean
  }

  export interface CookieMethodsServer {
    getAll(): Array<{ name: string; value: string }>
    setAll(cookies: Array<{ name: string; value: string; options?: CookieOptions }>): void
  }

  export interface User {
    id: string
    email?: string
    [key: string]: unknown
  }

  // Minimal shape — we only use auth.* and .from()
  interface AnySupabaseClient {
    auth: {
      getUser(): Promise<{ data: { user: User | null } }>
      signInWithOtp(opts: { email: string; options?: { emailRedirectTo?: string } }): Promise<{ error: { message: string } | null }>
      signInWithPassword(opts: { email: string; password: string }): Promise<{ error: { message: string } | null }>
      exchangeCodeForSession(code: string): Promise<{ error: { message: string } | null }>
      signOut(): Promise<{ error: { message: string } | null }>
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from(table: string): any
  }

  export function createBrowserClient(url: string, key: string): AnySupabaseClient
  export function createServerClient(
    url: string,
    key: string,
    opts: { cookies: CookieMethodsServer }
  ): AnySupabaseClient
}
