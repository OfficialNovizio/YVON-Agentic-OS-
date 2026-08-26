'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Discover was merged into Companies on 2026-08-25 (pull controls, platform
// filter, pagination, PR/pay on cards all live at /job-hunt/companies now).
// This route stays as a redirect so old links keep working.
export default function DiscoverRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/job-hunt/companies') }, [router])
  return null
}
