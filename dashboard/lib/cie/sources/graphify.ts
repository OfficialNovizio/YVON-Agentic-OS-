// lib/cie/sources/graphify.ts — Graphify keyword-graph reader (stub).
//
// TODO: wire to real graphify backend (in-project rag/ pipeline).
// Until then: returns empty results — retriever.ts degrades to other sources.

/**
 * Query the graphify knowledge graph for concepts related to the given keywords.
 * Returns a string of relevant context (empty if nothing found or backend not wired).
 */
export function queryGraphify(_keywords: string[]): string {
  return ''
}
