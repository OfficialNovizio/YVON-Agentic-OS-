// /login — Username + password sign-in.
// Usernames are the BOD member's short handle (e.g. 'novy738'); the app
// synthesizes a fake email 'username@yvon.internal' behind the scenes so
// Supabase Auth (which requires an email) is happy. Users never see the suffix.
//
// Invite-only: the 3 accounts (novy738 / sagar739 / amit740) are pre-seeded.
// No public signup surface — a bad username or password just errors.
//
// Owner: mia · TS-009 WI-0 (v2 — password auth)
'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Lock, User as UserIcon } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'

const EMAIL_DOMAIN = 'yvon.internal'

function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const nextParam = search?.get('next') || '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    const uname = username.trim().toLowerCase()
    if (!uname || !password) return
    setSubmitting(true)
    setError('')

    const supabase = supabaseBrowser()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: `${uname}@${EMAIL_DOMAIN}`,
      password,
    })

    if (authError) {
      setSubmitting(false)
      // Don't leak whether the username exists — flat "invalid credentials".
      setError('Invalid username or password.')
      return
    }

    // Session cookie is set. Server-rendered pages will see the user on refresh.
    // Full navigation ensures middleware sees the fresh session.
    window.location.replace(nextParam)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#06060a] p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-base font-bold text-[#06121f]">
            Y
          </div>
          <div>
            <div className="text-base font-semibold text-on-surface">YVON OS</div>
            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
              Mission Control
            </div>
          </div>
        </div>

        <form
          onSubmit={signIn}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-2xl backdrop-blur"
        >
          <h1 className="mb-1.5 text-lg font-semibold text-on-surface">Sign in</h1>
          <p className="mb-5 text-[13px] leading-relaxed text-on-surface-variant">
            Enter your YVON OS username and password.
          </p>

          <label htmlFor="username" className="mb-1.5 block text-[11px] font-medium text-on-surface-variant">
            Username
          </label>
          <div className="relative mb-4">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. novy738"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-[13px] text-on-surface placeholder:text-on-surface-variant/60 focus:border-white/25 focus:outline-none"
            />
          </div>

          <label htmlFor="password" className="mb-1.5 block text-[11px] font-medium text-on-surface-variant">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-[13px] text-on-surface placeholder:text-on-surface-variant/60 focus:border-white/25 focus:outline-none"
            />
          </div>

          {error && (
            <p className="mt-3 rounded-md border border-error/25 bg-error/10 px-3 py-2 text-[12px] text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !username.trim() || !password}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary to-accent py-2.5 text-[13px] font-semibold text-[#06121f] transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-on-surface-variant/70">
          Access is invite-only.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  // useSearchParams requires Suspense in Next 15 app router.
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#06060a]" />}>
      <LoginForm />
    </Suspense>
  )
}
