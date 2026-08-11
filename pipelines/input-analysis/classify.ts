// Input Analysis pipeline — stage 1: pre-classify (deterministic).
// Tier (generic/info/build) + relation (venture/general) from keywords.
import type { InputTier, MessageRelation } from './types'

// Action/build verbs — the one signal that a message is actually asking for
// work to be done, not just talked about. Shared by detectRelation (below)
// and classifyTier's tier fallback, so the two stay in sync instead of
// drifting into two separate opinions of what counts as "actionable".
const ACTION_VERBS = /\b(fix|debug|build|implement|deploy|refactor|change|update|edit|create|add|remove|test|review)\b/i

// Keywords suggesting the message relates to the active venture / project.
const VENTURE_MARKERS = [
  /\b(our|the project|the repo|the codebase|the brand|the app|the site|the product|the venture)\b/i,
  ACTION_VERBS,
  /\b(cart|checkout|dashboard|api|route|component|page|migration|schema|bug|issue|task|roadmap|feature)\b/i,
  /\b(venture|repo|repository|github|supabase|vercel|deploy|release|sprint|standup)\b/i,
  /\b(our|we|us|my)\b/i,
]

/** Deterministic relation: venture if it references the project/actions, else general. */
export function detectRelation(message: string): MessageRelation {
  const t = message.trim()
  if (/\b(top\s+\d+|best|richest|most expensive|population|capital|history|famous|world|earth|planet|global)\b/i.test(t) && !VENTURE_MARKERS.some((m) => m.test(t))) {
    return 'general'
  }
  return VENTURE_MARKERS.some((m) => m.test(t)) ? 'venture' : 'general'
}

/** Cheap deterministic pre-classify. */
export function classifyTier(message: string): InputTier {
  const t = message.trim().toLowerCase()
  if (t.startsWith('/')) return 'generic'

  const generic = [
    'hi', 'hey', 'hello', 'yo', 'sup', 'hola', 'hai',
    'hi everyone', 'hey everyone', 'hello everyone', 'good morning', 'good evening',
    'thanks', 'thank you', 'ty', 'ok', 'okay', 'k', 'sure', 'yes', 'no', 'bye',
    'whats up', 'what\'s up', 'how are you', 'how r u', 'gm', 'gn',
  ]
  if (generic.includes(t) || (t.length <= 6 && !t.includes(' '))) return 'generic'

  const infoMarkers = [
    /^(what|who|where|when|which|how|why|is|are|can|could|do|does|did|will|would|should|tell me|explain|define|list|name|give me|show me)\b/,
    /\?$/,
    /\b(top|best|cheapest|most expensive|largest|smallest)\s+\d+\b/,  // "top 10 X"
  ]
  if (infoMarkers.some((m) => m.test(t))) return 'info'

  // Neither an exact greeting nor a recognizable question shape (e.g. "Hey
  // guys, what's new today" — leads with an address, ends without "?", so
  // the infoMarkers above don't fire). Only default to 'build' when the
  // message actually contains an action/build verb; otherwise this is
  // ambiguous casual phrasing, and 'info' is the safer default — it skips
  // full build analysis + must-haves instead of inventing a fake task.
  return ACTION_VERBS.test(t) ? 'build' : 'info'
}
