import type { JobSource } from '../types'
import { adzunaSource } from './adzuna'
import { remoteOkSource } from './remoteok'
import { remotiveSource } from './remotive'
import { arbeitnowSource } from './arbeitnow'
import { greenhouseSource } from './greenhouse'
import { freehireSource } from './freehire'

// LinkedIn deliberately not included — see migrations/122_job_hunt_discovery.sql.
// RULE CHANGE (2026-08-25, operator override): Indeed + LinkedIn ARE now
// pulled, via vps-scripts/fetch-hiring-boards.py (python-jobspy, public/
// guest data only, no login automation) — the override is recorded there.
export const JOB_SOURCES: JobSource[] = [
  adzunaSource,
  remoteOkSource,
  remotiveSource,
  arbeitnowSource,
  greenhouseSource,
  freehireSource,
]

export function getSource(id: string): JobSource | undefined {
  return JOB_SOURCES.find((s) => s.id === id)
}
