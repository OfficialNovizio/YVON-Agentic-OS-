'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Lightweight local sub-nav (same pattern as settings/venture's SubTabs,
// kept separate since that one is a private component of that page).
const TABS = [
  { href: '/job-hunt', label: 'Profile' },
  { href: '/job-hunt/resume', label: 'Resume' },
  { href: '/job-hunt/discover', label: 'Discover' },
  { href: '/job-hunt/companies', label: 'Companies' },
  { href: '/job-hunt/network', label: 'Network' },
  { href: '/job-hunt/linkedin', label: 'LinkedIn' },
]

export default function JobHuntLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const active = pathname === t.href
          return (
            <Link key={t.href} href={t.href}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition ${
                active ? 'border-current text-on-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
              style={active ? { color: 'var(--ws-accent)', borderColor: 'var(--ws-accent)' } : undefined}>
              {t.label}
            </Link>
          )
        })}
      </div>
      {children}
    </div>
  )
}
