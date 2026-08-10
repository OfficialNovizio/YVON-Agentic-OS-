// Input Analysis pipeline — stage 2: extract (dynamic fields, deterministic).
// type/subject/scope/format/expected from patterns (info tier).
export function parseInfo(message: string): {
  type: string
  subject: string
  scope: string
  format: string
  expected: string
} {
  const t = message.trim()
  const typeMatch = t.match(/^\s*(what|who|where|when|which|how|why|is|are|can|could|do|does|did|will|would|should|tell me|explain|define|list|name)\b/i)
  const type = typeMatch ? typeMatch[1].toLowerCase() : 'question'

  // Scope from "top N" / "best N" / "all" / "most" / "cheapest"
  let scope = 'general'
  const topN = t.match(/\b(top|best|cheapest|most expensive|largest|smallest)\s+(\d+)\b/i)
  if (topN) {
    scope = `top-${topN[2]}`
  } else if (/\b(top|best|most expensive|cheapest|largest)\b/i.test(t)) {
    scope = 'top'
  } else if (/\ball\b/i.test(t)) {
    scope = 'all'
  }

  // Subject: strip the leading interrogative + filler, keep the core topic
  let subject = t
    .replace(/^\s*(tell me|explain|define|list|name|give me|show me)\s+/i, '')
    .replace(/^\s*(what|who|where|when|which|how|why|is|are|can|could|do|does|did|will|would|should)\s+/i, '')
    .replace(/^\s*(is|the|a|an)\s+/i, '')
    .replace(/\s*[?]+$/i, '')
    .replace(/\b(please|pls)\b/gi, '')
    .replace(/\b(top|best|cheapest|most expensive|largest|smallest)\s+(\d+)\b/i, '')
    .replace(/\b(most expensive|cheapest|best|top|largest|smallest)\b/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  if (!subject) subject = t.slice(0, 60)

  // Format from words
  let format = 'answer'
  if (/\b(list|top|best|cheapest|largest|most expensive)\b/i.test(t)) format = 'list'
  else if (/\b(number|how many|how much|population|price|cost)\b/i.test(t)) format = 'number'
  else if (/\b(table|chart|compare)\b/i.test(t)) format = 'table'
  else if (/\b(explain|describe|why|how does)\b/i.test(t)) format = 'explanation'

  // Expected — derived from the message (what the answer should be)
  let expected = 'an accurate answer'
  if (format === 'list') expected = `a ${scope === 'general' ? '' : scope + ' '}ranked list`
  else if (format === 'number') expected = 'a specific number'
  else if (format === 'table') expected = 'a comparison table'
  else if (format === 'explanation') expected = 'a clear explanation'

  return { type, subject, scope, format, expected }
}
