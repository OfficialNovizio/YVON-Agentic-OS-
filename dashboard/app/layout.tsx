import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { WorkspaceProvider } from '@/lib/WorkspaceContext'
import { Shell } from '@/components/Shell'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker'
import AgentationToolbar from '@/components/AgentationToolbar'
import SessionGate from '@/app/session-gate'

export const metadata: Metadata = {
  title: 'YVON OS · Mission Control',
  description: 'AI agent command center — 46 agents, 7 departments, one control plane.',
  // iOS PWA — required for add-to-home-screen behavior
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'YVON OS',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#06060a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // for iPhone notch / safe areas
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-on-surface bg-yvon-image min-h-screen">
        <SessionGate>
          <WorkspaceProvider>
            <ErrorBoundary>
              <Shell>{children}</Shell>
            </ErrorBoundary>
          </WorkspaceProvider>
        </SessionGate>
        <RegisterServiceWorker />
        <AgentationToolbar />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
