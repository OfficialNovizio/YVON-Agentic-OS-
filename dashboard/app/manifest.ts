// PWA manifest — installable on iPhone/Android/desktop.
// Next 15 auto-serves this at /manifest.webmanifest.
// Owner: mia · TS-014 WI-2
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'YVON OS · Mission Control',
    short_name: 'YVON OS',
    description: 'AI agent command center — 46 agents, 7 departments, one control plane.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#06060a',
    theme_color: '#06060a',
    categories: ['productivity', 'business'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
