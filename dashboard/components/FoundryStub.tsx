// FoundryStub — shared placeholder for /foundry/* sub-routes not yet wired
// to real backends. Each stub cites its source-of-truth file so operators
// know where the real content will come from (no fake data anywhere).
//
// Later TASK-SPECs replace each stub with the real subsystem UI.
'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { PageHeader, Card } from '@/components/ui'
import { ChevronRight, FileCode } from 'lucide-react'

export interface FoundryStubProps {
  /** Display title (e.g. "Tools") */
  title: string
  /** Short subtitle shown under the title */
  subtitle: string
  /**
   * What belongs on this page once wired. 1-3 short paragraphs (or JSX).
   * Kept in the stub so future maintainers see the intent.
   */
  description: ReactNode
  /**
   * Source-of-truth file path (relative to repo root) that this page will
   * eventually reflect. Shown so operators can find the real data now.
   */
  sourceOfTruth: string
  /** Optional: the TASK-SPEC id that will wire this stub (e.g. "TS-012") */
  wireSpec?: string
}

export function FoundryStub({
  title,
  subtitle,
  description,
  sourceOfTruth,
  wireSpec,
}: FoundryStubProps) {
  return (
    <div className="p-6 md:p-8">
      <nav
        aria-label="breadcrumb"
        className="mb-4 flex items-center gap-1.5 text-[12px] text-on-surface-variant"
      >
        <Link href="/foundry" className="hover:text-on-surface transition">
          Foundry
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-on-surface">{title}</span>
      </nav>

      <PageHeader title={title} subtitle={subtitle} />

      <Card className="p-6">
        <div className="max-w-2xl space-y-3 text-[14px] leading-relaxed text-on-surface-variant">
          {description}
        </div>

        <div className="mt-6 border-t border-white/[0.06] pt-4">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
            Source of truth
          </div>
          <code className="inline-flex items-center gap-2 rounded-md bg-white/[0.04] px-2.5 py-1.5 font-mono text-[12px] text-on-surface">
            <FileCode className="h-3.5 w-3.5 text-on-surface-variant" aria-hidden />
            {sourceOfTruth}
          </code>
          {wireSpec && (
            <p className="mt-3 text-[11px] text-on-surface-variant/70">
              Backend integration tracked in{' '}
              <span className="font-mono text-on-surface-variant">{wireSpec}</span>.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
