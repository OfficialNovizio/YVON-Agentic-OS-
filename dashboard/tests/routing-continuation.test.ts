// Unit tests for the 2026-09-04 routing changes: scorer hygiene (URL strip +
// word boundaries) and continuation-aware routing (resolveRoute stickiness).
// Replay of the user-reported misroute conversation — every row below is a
// real message from the session that broke.
import { routeAgents, resolveRoute, AGENT_STICKY_WINDOW_MS } from '../../pipelines/input-analysis/routing'
import type { AgentRoute } from '../../pipelines/input-analysis/routing'

let fail = 0
const ck = (name: string, cond: boolean, extra?: unknown) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name)
  if (!cond) { fail++; if (extra !== undefined) console.log('         ', JSON.stringify(extra)) }
}
const H = (s: string) => console.log('\n' + s)

const MIN = 60_000
// a route as resolveRoute would receive it from the stream route
const route = (msg: string): AgentRoute => routeAgents(msg)

H('[1] scorer hygiene — URLs are stripped before scoring')
{
  // the exact message that stole the frame and handed it to meta
  const r = route('yes i have a reference website - https://shop.brunellocucinelli.com/en-gb/ai')
  ck('no bucket scores the URL text', r.scores.length === 0, r.scores)
  ck('no ops hit from the word url in a link', r.primary !== 'ops')
}
{
  // "shop" must not match ops-style tokens; domain words are inert
  const r = route('check https://example.com/repository/clone/deploy/preview for me')
  ck('a link full of infra words routes to nobody', r.scores.length === 0, r.scores)
}

H('[2] scorer hygiene — word boundaries')
{
  ck('"build" no longer matches the ui keyword', route('build me a dashboard').scores.every((s) => !s.hits.includes('ui')))
  ck('"luxury" no longer matches the ux keyword', route('a luxury experience').scores.every((s) => !s.hits.includes('ux')))
  ck('"important" no longer matches port', route('an important port to watch').scores.every((s) => !s.hits.includes('port')))
  ck('"digit" no longer matches git', route('digitize this').scores.every((s) => !s.hits.includes('git')))
  ck('a REAL ui word still matches', route('the ui needs work').scores.find((s) => s.agent === 'mia') !== undefined)
  ck('a REAL url word still matches', route('the url is broken').scores.find((s) => s.agent === 'ops') !== undefined)
}

H('[3] stickiness — replay of the broken conversation (previous agent mia)')
{
  const prev = { previousAgent: 'mia', previousAt: new Date(Date.now() - 2 * MIN).toISOString() }

  // turn 1: fresh room — scorer decides
  const r1 = resolveRoute(route('I want to make new landing page design'), {})
  ck('turn 1: new frame', r1.sticky === false && r1.primary === 'mia', r1)

  // turn 2: bare URL, zero keyword signal — was the meta fallback
  const r2 = resolveRoute(route('yes i have a reference website - https://shop.brunellocucinelli.com/en-gb/ai'), prev)
  ck('turn 2: held with mia (was meta)', r2.primary === 'mia' && r2.sticky === true, r2)
  ck('turn 2: resolution says why', r2.resolution.includes('no keyword signal'), r2.resolution)

  // turn 3: bare "design" — was the spark hijack
  const r3 = resolveRoute(route('I want exact same design as the website including all elements i has'), prev)
  ck('turn 3: weak design match does not steal the frame', r3.primary === 'mia' && r3.sticky === true, r3)

  // turn 4: "this is the url ..." — was the ops hijack
  const r4 = resolveRoute(route('i am sorry this is the url - https://shop.brunellocucinelli.com/en-gb/'), prev)
  ck('turn 4: weak url match does not steal the frame', r4.primary === 'mia' && r4.sticky === true, r4)

  // turn 5: "create exact same design" — was spark again
  const r5 = resolveRoute(route('create exact same design including everything'), prev)
  ck('turn 5: held with mia', r5.primary === 'mia' && r5.sticky === true, r5)
}

H('[4] stickiness — legitimate releases still happen')
{
  const prev = { previousAgent: 'mia', previousAt: new Date(Date.now() - 2 * MIN).toISOString() }

  // strong signal (score >= 2): genuine topic change
  const deploy = resolveRoute(route('ok now deploy this to the server and set up the ci/cd pipeline'), prev)
  ck('strong infra signal releases from mia', deploy.primary === 'ops' && deploy.sticky === false, deploy)

  // explicit mention is handled before resolveRoute in the stream route —
  // this asserts the residual behaviour: mention-less strong signal only.
  // A weak single-keyword mention-less message stays.
  const weak = resolveRoute(route('make the button nicer'), prev)
  ck('weak match holds', weak.primary === 'mia' && weak.sticky === true, weak)
}

H('[5] stickiness — hold lapses after the idle window')
{
  const lapsed = { previousAgent: 'mia', previousAt: new Date(Date.now() - (AGENT_STICKY_WINDOW_MS + MIN)).toISOString() }
  const r = resolveRoute(route('yes i have a reference website - https://shop.brunellocucinelli.com/en-gb/ai'), lapsed)
  ck('lapsed hold → new frame, scorer decides (meta)', r.primary === 'meta' && r.sticky === false, r)

  // a missing previousAt must not count as fresh forever
  const noTs = resolveRoute(route('yes i have a reference website'), { previousAgent: 'mia', previousAt: null })
  ck('missing timestamp → treated as lapsed', noTs.sticky === false, noTs)
}

H('[6] no previous agent → scorer decides as before')
{
  const r = resolveRoute(route('fix the database migration'), {})
  ck('dana wins a fresh db request', r.primary === 'dana', r)
  ck('resolution explains new frame', r.resolution.includes('new frame'), r.resolution)
}

console.log(fail === 0 ? '\nALL PASS' : `\nFAILURES: ${fail}`)
process.exit(fail === 0 ? 0 : 1)
