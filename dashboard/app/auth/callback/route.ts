// /auth/callback — handles the magic-link redirect.
// Supabase sends the user here with ?code=... which we exchange for a session.
// Owner: raj · TS-009 WI-0
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/chat'
  const errorParam = searchParams.get('error_description') || searchParams.get('error')

  // If Supabase reported an error (e.g. expired link), send the user back to login.
  if (errorParam) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', errorParam)
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const supabase = await supabaseServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('error', error.message)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
