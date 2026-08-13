import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// unsafe-eval is required by Next.js HMR in dev but must not ship to production.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline'"

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https:",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  // 2026-08-12 (same day, follow-up to the DefinePlugin below): `output:
  // 'standalone'` (+ its `outputFileTracingRoot`) removed — Vercel advises
  // against standalone output on their own platform (they produce their own
  // optimized deployment output; combining the two is a documented source of
  // bundling inconsistencies). The middleware `__dirname` outage survived the
  // DefinePlugin alone, so this was the recorded next step. Vercel traces and
  // bundles edge code itself; nothing here needs the standalone trace.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/marketing-agent', destination: '/agents/lena-brand',       permanent: true },
      { source: '/coding-agent',    destination: '/agents/dev-lead',          permanent: true },
      { source: '/website-agent',   destination: '/agents/zara-competitor',   permanent: true },
      { source: '/agent-manager',   destination: '/agents',                    permanent: true },
      // TS-011: Skill Workshop renamed → Foundry hub; skills page lives under /foundry/skills.
      { source: '/skill-workshop',  destination: '/foundry/skills',           permanent: true },
    ]
  },
  // 2026-08-12 outage fix: middleware.ts (Edge Runtime) crashed site-wide with
  // "ReferenceError: __dirname is not defined". Root cause: next/server itself
  // transitively bundles ua-parser-js (confirmed via middleware.js.map's
  // sourcesContent), which references __dirname internally. Local `next build`
  // tree-shakes that code path away since we never call any UA-parsing helper
  // — so it never reproduced here — but Vercel's actual deployed Edge Function
  // bundler doesn't tree-shake it the same way (known Next.js/Vercel platform
  // gap, not specific to any one package: same symptom is separately reported
  // against next-intl, next-auth, and @supabase/ssr — see
  // github.com/vercel/next.js/issues/53968 and
  // github.com/supabase/supabase/issues/21009). Upgrading @supabase/ssr
  // (0.5.2 → 0.12.4, same day) did not fix it, confirming the reference isn't
  // coming from that package specifically.
  //
  // Fix: force-define __dirname as a literal string for the edge compilation
  // only, so if webpack (on any platform's bundler) ever encounters the
  // token, it resolves to a constant instead of throwing at runtime. Scoped
  // to nextRuntime === 'edge' so the Node.js server compilation (which has a
  // real __dirname) is untouched.
  //
  // Status 2026-08-12 evening: the DefinePlugin alone did NOT stop the live
  // outage (still MIDDLEWARE_INVOCATION_FAILED after the fix deploy) — hence
  // the standalone-output removal above. Kept here as belt-and-braces: if the
  // edge bundle ever references __dirname it now resolves to a constant. If
  // the outage STILL persists after dropping standalone, the next lever is
  // aliasing ua-parser-js to an empty stub in this edge-only webpack block.
  webpack(config, { nextRuntime, webpack }) {
    if (nextRuntime === 'edge') {
      config.plugins.push(
        new webpack.DefinePlugin({ __dirname: JSON.stringify('/') })
      )
    }
    return config
  },
}

export default nextConfig
