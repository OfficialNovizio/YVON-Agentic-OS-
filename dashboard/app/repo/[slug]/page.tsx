// /repo/[slug] — read-only browser over a venture's REAL working checkout
// (the same persistent per-venture repo Hermes actually cd's into for chat
// turns — see vps-scripts/yvon-hermes-http/main.py's REPO_WORKSPACES_DIR),
// not a redirect to GitHub. Part of the "give me a URL to view repo files"
// feature (2026-08-21) — linked from chat replies via stream/route.ts.
//
// Server wrapper just resolves the async route param (Next 15 convention,
// matches app/api/ventures/[id]/route.ts) and hands off to the client
// component that does the actual fetching/rendering.
import { RepoBrowserClient } from './RepoBrowserClient'

export default async function RepoBrowserPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <RepoBrowserClient ventureSlug={slug} />
}
