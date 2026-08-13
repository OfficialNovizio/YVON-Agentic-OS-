// Edge-runtime stub for ua-parser-js (2026-08-12 outage, round 3).
//
// next/server bundles ua-parser-js transitively, and its code references
// `__dirname`, which does not exist in Vercel's Edge isolate — that is the
// root cause of the site-wide `MIDDLEWARE_INVOCATION_FAILED` crash. Our
// middleware (dashboard/middleware.ts) never parses a User-Agent string, so
// the module is dead weight in the edge bundle. Aliasing it to this stub in
// next.config.ts (edge compilation only) removes the reference entirely.
//
// If Next ever legitimately needs UA parsing on an edge path, the no-op
// UAParser below is a functional placeholder, and a real call would surface
// as a TypeError at the call site — loud, not silent.
'use strict'

class UAParser {
  constructor() {}
  getResult() { return {} }
  getUA() { return '' }
  setUA() { return this }
  setMaxAge() { return this }
  clone() { return new UAParser() }
}

module.exports = { UAParser }
module.exports.default = { UAParser }
module.exports.UAParser = UAParser
