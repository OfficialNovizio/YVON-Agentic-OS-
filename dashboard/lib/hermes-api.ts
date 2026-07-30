// hermes-api — typed client for the Hermes API proxy (TS-018).
//
// All calls go through /api/hermes-proxy/[...path] which adds the bearer token
// server-side. This library provides type-safe access to all 176 Hermes endpoints.
//
// Categories: status, sessions, mcp, skills, kanban, profiles, gateway, webhooks,
//             cron, config, credentials, model, memory, tools, ops
//
// Owner: raj · TS-018 WI-2

const BASE = '/api/hermes-proxy'

/** Generic fetch wrapper for Hermes API calls. */
async function hermesFetch<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string>,
): Promise<T> {
  let url = `${BASE}/${path.replace(/^\//, '')}`
  if (params) {
    const qs = new URLSearchParams(params).toString()
    if (qs) url += `?${qs}`
  }

  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Hermes ${res.status}`)
  }

  // Some endpoints return empty (204/202)
  const text = await res.text()
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T)
}

// ─── Status & Health ───────────────────────────────────────────────────────

export async function hermesStatus() {
  return hermesFetch<{ ok: boolean; version?: string }>('GET', 'status')
}

export async function systemStats() {
  return hermesFetch<{ cpu: number; mem: number; disk: number }>('GET', 'system/stats')
}

// ─── Sessions ──────────────────────────────────────────────────────────────

export async function listSessions(params?: { limit?: string; offset?: string }) {
  return hermesFetch<unknown[]>('GET', 'sessions', undefined, params)
}

export async function getSession(sessionId: string) {
  return hermesFetch<unknown>('GET', `sessions/${sessionId}`)
}

export async function deleteSession(sessionId: string) {
  return hermesFetch<void>('DELETE', `sessions/${sessionId}`)
}

export async function searchSessions(q: string) {
  return hermesFetch<unknown[]>('GET', 'sessions/search', undefined, { q })
}

// ─── MCP Servers ───────────────────────────────────────────────────────────

export async function listMcpServers() {
  return hermesFetch<unknown[]>('GET', 'mcp/servers')
}

export async function addMcpServer(config: unknown) {
  return hermesFetch<unknown>('POST', 'mcp/servers', config)
}

export async function removeMcpServer(name: string) {
  return hermesFetch<void>('DELETE', `mcp/servers/${encodeURIComponent(name)}`)
}

export async function toggleMcpServer(name: string, enabled: boolean) {
  return hermesFetch<unknown>('PUT', `mcp/servers/${encodeURIComponent(name)}/enabled`, { enabled })
}

export async function testMcpServer(name: string) {
  return hermesFetch<{ ok: boolean }>('POST', `mcp/servers/${encodeURIComponent(name)}/test`)
}

// ─── Skills ────────────────────────────────────────────────────────────────

export async function listSkills() {
  return hermesFetch<unknown[]>('GET', 'skills')
}

export async function toggleSkill(name: string, enabled: boolean) {
  return hermesFetch<unknown>('PUT', 'skills/toggle', { name, enabled })
}

export async function searchSkillHub(query: string) {
  return hermesFetch<unknown[]>('GET', 'skills/hub/search', undefined, { q: query })
}

export async function installSkill(source: string) {
  return hermesFetch<unknown>('POST', 'skills/hub/install', { source })
}

// ─── Kanban / Task Board ───────────────────────────────────────────────────

export async function getKanbanBoard() {
  return hermesFetch<unknown>('GET', 'plugins/kanban/board')
}

export async function listKanbanBoards() {
  return hermesFetch<unknown[]>('GET', 'plugins/kanban/boards')
}

export async function createKanbanBoard(data: { name: string; slug: string }) {
  return hermesFetch<unknown>('POST', 'plugins/kanban/boards', data)
}

export async function deleteKanbanBoard(slug: string) {
  return hermesFetch<void>('DELETE', `plugins/kanban/boards/${slug}`)
}

export async function createTask(data: unknown) {
  return hermesFetch<unknown>('POST', 'plugins/kanban/tasks', data)
}

export async function getTask(taskId: string) {
  return hermesFetch<unknown>('GET', `plugins/kanban/tasks/${taskId}`)
}

export async function updateTask(taskId: string, data: unknown) {
  return hermesFetch<unknown>('PATCH', `plugins/kanban/tasks/${taskId}`, data)
}

export async function deleteTask(taskId: string) {
  return hermesFetch<void>('DELETE', `plugins/kanban/tasks/${taskId}`)
}

export async function decomposeTask(taskId: string) {
  return hermesFetch<unknown>('POST', `plugins/kanban/tasks/${taskId}/decompose`)
}

export async function specifyTask(taskId: string) {
  return hermesFetch<unknown>('POST', `plugins/kanban/tasks/${taskId}/specify`)
}

export async function dispatchWork(data: unknown) {
  return hermesFetch<unknown>('POST', 'plugins/kanban/dispatch', data)
}

export async function getKanbanStats() {
  return hermesFetch<unknown>('GET', 'plugins/kanban/stats')
}

// ─── Profiles ──────────────────────────────────────────────────────────────

export async function listProfiles() {
  return hermesFetch<unknown[]>('GET', 'profiles')
}

export async function getActiveProfile() {
  return hermesFetch<unknown>('GET', 'profiles/active')
}

export async function setActiveProfile(name: string) {
  return hermesFetch<unknown>('POST', 'profiles/active', { name })
}

// ─── Model ─────────────────────────────────────────────────────────────────

export async function getModelInfo() {
  return hermesFetch<unknown>('GET', 'model/info')
}

export async function getModelOptions() {
  return hermesFetch<unknown[]>('GET', 'model/options')
}

export async function setModel(modelId: string, scope?: string) {
  return hermesFetch<unknown>('POST', 'model/set', { model: modelId, scope })
}

// ─── Config / Env ──────────────────────────────────────────────────────────

export async function getConfig() {
  return hermesFetch<unknown>('GET', 'config')
}

export async function updateConfig(data: unknown) {
  return hermesFetch<unknown>('PUT', 'config', data)
}

export async function listEnv() {
  return hermesFetch<Record<string, string>>('GET', 'env')
}

export async function setEnv(key: string, value: string) {
  return hermesFetch<unknown>('PUT', 'env', { key, value })
}

export async function deleteEnv(key: string) {
  return hermesFetch<void>('DELETE', 'env', { key })
}

// ─── Cron ──────────────────────────────────────────────────────────────────

export async function listCronJobs() {
  return hermesFetch<unknown[]>('GET', 'cron/jobs')
}

export async function createCronJob(data: unknown) {
  return hermesFetch<unknown>('POST', 'cron/jobs', data)
}

export async function triggerCronJob(jobId: string) {
  return hermesFetch<unknown>('POST', `cron/jobs/${jobId}/trigger`)
}

// ─── Tools / Toolsets ──────────────────────────────────────────────────────

export async function listToolsets() {
  return hermesFetch<unknown[]>('GET', 'tools/toolsets')
}

// ─── Memory ────────────────────────────────────────────────────────────────

export async function getMemory() {
  return hermesFetch<unknown>('GET', 'memory')
}

// ─── Webhooks ──────────────────────────────────────────────────────────────

export async function listWebhooks() {
  return hermesFetch<unknown[]>('GET', 'webhooks')
}

export async function createWebhook(data: unknown) {
  return hermesFetch<unknown>('POST', 'webhooks', data)
}

// ─── Ops ───────────────────────────────────────────────────────────────────

export async function runDoctor() {
  return hermesFetch<unknown>('POST', 'ops/doctor')
}

export async function runBackup() {
  return hermesFetch<unknown>('POST', 'ops/backup')
}

// ─── Messaging / Gateway ───────────────────────────────────────────────────

export async function getMessagingPlatforms() {
  return hermesFetch<unknown[]>('GET', 'messaging/platforms')
}

// ─── Raw (for ad-hoc endpoints not covered above) ──────────────────────────

export async function hermesGet<T = unknown>(path: string, params?: Record<string, string>) {
  return hermesFetch<T>('GET', path, undefined, params)
}

export async function hermesPost<T = unknown>(path: string, body?: unknown) {
  return hermesFetch<T>('POST', path, body)
}
