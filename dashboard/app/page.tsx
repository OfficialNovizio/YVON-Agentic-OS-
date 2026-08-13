// Root landing — the actual redirect to /decision-queue is now a router-level
// redirect in next.config.ts (async redirects()). Keeping this file as a
// minimal page so / still has a route target; if the config redirect is
// active this page never renders.
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/decision-queue')
}
