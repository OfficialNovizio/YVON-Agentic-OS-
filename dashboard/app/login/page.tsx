// /login — Supabase magic-link entry point.
// User types email → Supabase mails them a link → link hits /auth/callback → session.
// Owner: mia · TS-009 WI-0
'use client'

import { useState } from 'react'
import { Mail, Loader2, Check } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setErrorMsg('')

    // Redirect back to /auth/callback on the SAME origin the user is on now.
    // Both prod (yvon.in) and preview URLs work as long as Supabase's URL
    // Configuration allows them (see TS-009 setup notes in TS-009.yaml).
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=/chat`

    const supabase = supabaseBrowser()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo },
    })
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
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

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-2xl backdrop-blur">
          {status === 'sent' ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                <Check className="h-5 w-5" />
              </div>
              <h1 className="mb-1.5 text-lg font-semibold text-on-surface">Check your email</h1>
              <p className="text-[13px] leading-relaxed text-on-surface-variant">
                We sent a magic link to{' '}
                <span className="text-on-surface">{email}</span>. Click it to sign in.
                The link expires in 60 minutes.
              </p>
              <button
                onClick={() => {
                  setStatus('idle')
                  setEmail('')
                }}
                className="mt-5 text-[12px] text-on-surface-variant underline underline-offset-2 hover:text-on-surface"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={sendMagicLink}>
              <h1 className="mb-1.5 text-lg font-semibold text-on-surface">Sign in</h1>
              <p className="mb-5 text-[13px] leading-relaxed text-on-surface-variant">
                Enter your work email and we&rsquo;ll send you a magic link. No passwords.
              </p>

              <label htmlFor="email" className="mb-1.5 block text-[11px] font-medium text-on-surface-variant">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-[13px] text-on-surface placeholder:text-on-surface-variant/60 focus:border-white/25 focus:outline-none"
                />
              </div>

              {status === 'error' && (
                <p className="mt-2 text-[12px] text-error">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending' || !email.trim()}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary to-accent py-2.5 text-[13px] font-semibold text-[#06121f] transition hover:opacity-90 disabled:opacity-50"
              >
                {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === 'sending' ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-[11px] text-on-surface-variant/70">
          Access is invite-only. Only invited BOD members can sign in.
        </p>
      </div>
    </div>
  )
}
