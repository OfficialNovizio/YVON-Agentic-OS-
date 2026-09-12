const R = require('./routetest/routing.js');
// The EXACT user messages from room c0bd93e4, in order, plus the follow-ups
// the gate/motion layer injects. Replayed through the REAL routeAgents +
// resolveRoute, carrying the previous agent forward like the server does.
const SEQ = [
  ["I want to clone this website exactly - https://www.offforum.com/", "expect mia (new frame)"],
  ["convert to task",                                                  "expect HOLD mia"],
  ["[GATE DECISION] Reference (https://www.offforum.com/): IDENTICAL CLONE - replicate the reference's structure, layout, sections and motion exactly; replace all text and images with our venture's own content and brand. Continue: finish the design study and prepare the design brief.", "expect HOLD mia"],
  ["Motion decision: PURE CODE motion (CSS + GSAP + motion, $0 - all installed and MIT). Continue: prepare the design brief reproducing the reference's motion in code, then design.md.", "expect HOLD mia"],
  ["Both gates are answered and design.md is complete (deep-measured). Prepare the PRD proposal for the build now.", "expect HOLD mia"],
  ["Start build on TS-001 - begin execution now.",                      "new request - any agent"],
  ["[TASK FIX] TS-001 - fix these gaps from the verify pass: 1. the route renders the dev widget", "expect HOLD"],
];
let prev = null, prevAt = new Date().toISOString();
let fails = 0;
console.log("step  prev      -> primary   sticky  resolution");
console.log("-".repeat(108));
SEQ.forEach((row, i) => {
  const [msg, want] = row;
  const route = R.routeAgents(msg);
  const res = R.resolveRoute(route, { previousAgent: prev, previousAt: prevAt, message: msg });
  const held = res.primary === prev;
  const expectHold = want.startsWith("expect HOLD");
  const bad = prev !== null && expectHold && !held;
  if (bad) fails++;
  console.log(
    String(i+1).padStart(2) + "   " +
    String(prev || "-").padEnd(9) + " -> " +
    String(res.primary).padEnd(9) + " " +
    String(res.sticky).padEnd(7) + " " +
    (bad ? "*** FAIL *** " : "") + res.resolution.slice(0, 58)
  );
  console.log("      want: " + want + "  | scorer top: " + (route.scores[0] ? route.scores[0].agent + "@" + route.scores[0].score : "none"));
  prev = res.primary; prevAt = new Date().toISOString();
});
console.log("-".repeat(108));
console.log(fails === 0 ? "FLOW RESULT: PASS - frame held on every continuation" : "FLOW RESULT: " + fails + " FAILURE(S)");
