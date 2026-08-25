// task-theme.ts — shared stage metadata for the Tasks panel (chat's task
// section) and anywhere else that renders TASK-SPEC stage cards. One
// definition, so the card row always matches cli/task.py's real STATES list
// (draft → discovery → approved → executing → gated → review → done) instead of
// drifting out of sync with it.

export type TaskStage = 'draft' | 'discovery' | 'approved' | 'executing' | 'gated' | 'review' | 'done'

export const TASK_STAGES: { key: TaskStage; label: string; hint: string }[] = [
  { key: 'draft', label: 'Draft', hint: 'Captured, not yet scoped' },
  { key: 'discovery', label: 'Discovery', hint: 'Blocking — needs decisions' },
  { key: 'approved', label: 'Approved', hint: 'Scoped, ready to start' },
  { key: 'executing', label: 'Executing', hint: 'Work items in flight' },
  { key: 'gated', label: 'Gated', hint: 'Awaiting exit proof' },
  { key: 'review', label: 'Review', hint: 'Suite ran — evidence decides' },
  { key: 'done', label: 'Done', hint: 'Shipped' },
]

export function stageIndex(stage: string): number {
  return TASK_STAGES.findIndex((s) => s.key === stage)
}

/** Violet for the active stage, charcoal-on-lime for done, hairline-quiet for upcoming. */
export function stageTint(stage: TaskStage, current: TaskStage): 'done' | 'active' | 'upcoming' {
  const i = stageIndex(stage)
  const c = stageIndex(current)
  if (i < c || (i === c && stage === 'done')) return 'done'
  if (i === c) return 'active'
  return 'upcoming'
}
