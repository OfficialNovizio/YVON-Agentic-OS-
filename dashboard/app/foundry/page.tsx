// /foundry — YVON OS Foundry hub. Where agents are built, taught, and audited.
// Landing surface with 6 subsystem cards. Each links to its own sub-route
// (see /foundry/{skills,tools,mcp,training,rag,harness}).
//
// Owner: mia · TS-011 WI-1
'use client'

import Link from 'next/link'
import { PageHeader, Card } from '@/components/ui'
import {
  GraduationCap,
  Wrench,
  Plug,
  BookOpen,
  Network,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Subsystem {
  href: string
  label: string
  tagline: string
  Icon: LucideIcon
}

const SUBSYSTEMS: Subsystem[] = [
  {
    href: '/foundry/skills',
    label: 'Skills',
    tagline: 'Train agents on prompts; promote skills that pass the quality gate.',
    Icon: GraduationCap,
  },
  {
    href: '/foundry/tools',
    label: 'Tools',
    tagline: 'Shared tool registry — impeccable, Playwright, agentation, browser-use, and more.',
    Icon: Wrench,
  },
  {
    href: '/foundry/mcp',
    label: 'MCPs',
    tagline: 'Model Context Protocol servers — install, connect, inspect.',
    Icon: Plug,
  },
  {
    href: '/foundry/training',
    label: 'Training',
    tagline: 'Ingest books, docs, and playbooks into agent memory.',
    Icon: BookOpen,
  },
  {
    href: '/foundry/rag',
    label: 'RAG',
    tagline: 'CAOS pipeline — retriever health, chunk quality, source scoring.',
    Icon: Network,
  },
  {
    href: '/foundry/harness',
    label: 'Harness',
    tagline: '5-gate verifier — grounded citations, self-consistency, quarantine.',
    Icon: ShieldCheck,
  },
]

export default function FoundryHubPage() {
  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Foundry"
        subtitle="Where agents are built, taught, and audited. Six subsystems, one hub."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUBSYSTEMS.map(({ href, label, tagline, Icon }) => (
          <Link key={href} href={href} className="group focus-visible:outline-none">
            <Card
              hover
              className="h-full p-5 transition group-focus-visible:ring-2 group-focus-visible:ring-primary/50"
            >
              <div className="flex items-start gap-3">
                <div
                  className="rounded-lg p-2 shrink-0"
                  style={{ background: 'color-mix(in oklab, var(--ws-accent) 12%, transparent)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: 'var(--ws-accent)' }} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-on-surface">{label}</h2>
                    <ArrowRight
                      className="h-4 w-4 text-on-surface-variant transition group-hover:translate-x-0.5 group-hover:text-on-surface"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-on-surface-variant">
                    {tagline}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
