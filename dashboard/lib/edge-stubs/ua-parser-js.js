// Edge-runtime stub for ua-parser-js (2026-08-12 outage, round 5).
//
// ROOT CAUSE (confirmed): next/server's internal user-agent module
// (next/dist/server/web/spec-extension/user-agent.js:27) does
//   require("next/dist/compiled/ua-parser-js")
// — the copy of ua-parser-js COMPILED INSIDE next/dist. That code
// references `__dirname`, which does not exist in Vercel's Edge (V8)
// runtime → MIDDLEWARE_INVOCATION_FAILED / "ReferenceError: __dirname
// is not defined", site-wide. It is pulled in by ANY middleware that
// imports `next/server`, regardless of what we do with our own imports
// (rounds 1–4 confirmed this). Local `next build` never reproduces it
// because the platform's Edge bundler is what trips over the reference.
//
// Fix: alias BOTH specifiers — the bare `ua-parser-js` AND Next's
// internal `next/dist/compiled/ua-parser-js` — to this stub, edge-only.
// user-agent.js calls the default export AS A FUNCTION and spreads the
// result, so the default must be callable and return an object.
//
// If real UA parsing is ever needed on an edge path, this no-op will
// surface as a loud TypeError at the call site — never silent.
'use strict'

function uaParserStub() {
  return {}
}

module.exports = uaParserStub
module.exports.default = uaParserStub
module.exports.UAParser = uaParserStub
