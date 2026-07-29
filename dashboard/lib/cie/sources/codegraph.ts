// lib/cie/sources/codegraph.ts — Codegraph (symbol/AST) reader (stub).
//
// TODO: wire to real codegraph backend (in-project rag/ pipeline).
// Until then: returns empty results — retriever.ts degrades to other sources.

/**
 * Query the codegraph for symbols / references in the given files.
 * Returns a string of relevant code context (empty if nothing found or backend not wired).
 */
export function queryCodegraph(_paths: string[]): string {
  return ''
}
