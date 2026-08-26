"""Regression test for the process-global LLM meter.

v1 used threading.local() opened inside run_agent(). The after-deploy
benchmark returned llmCalls=0 on a turn that made 8 tool calls, because
hermes-agent does not issue HTTP on run_agent's thread (and may use the async
client, which v1 never hooked). This asserts the replacement is thread- and
loop-agnostic, which is the entire point of the rewrite.
"""
import os, re, sys, threading, asyncio, time
from typing import Any

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'main.py'), encoding='utf-8').read()

# lift the meter verbatim out of main.py
_start = src.index('_llm_counter_lock = threading.Lock()')
_end = src.index('@app.get("/healthz")') if '@app.get("/healthz")' in src[_start:] else len(src)
blk = src[_start:src.index('\n\n\n', src.index('def _llm_counter_totals'))]
ns: dict = {'threading': threading, 'Any': Any}
exec(compile(blk, '<lifted>', 'exec'), ns)
bump, snap, delta, totals = ns['_llm_counter_bump'], ns['_meter_snapshot'], ns['_meter_delta'], ns['_llm_counter_totals']

fail = 0
def ck(n, c):
    global fail
    print(("  PASS  " if c else "  FAIL  ") + n)
    if not c: fail += 1

print("\n[1] a turn measures only its own calls")
b = snap(); bump(1200); bump(800, 2.5); d = delta(b)
ck("llmCalls == 2",        d["llmCalls"] == 2)
ck("estInputTokens == 2000", d["estInputTokens"] == 2000)
ck("governorWaitS == 2.5", d["governorWaitS"] == 2.5)
ck("marked exact",         d["llmCallsExact"] is True)

print("\n[2] calls BEFORE the turn are not attributed to it")
bump(9999)                      # some other activity
b = snap(); bump(100); d = delta(b)
ck("only the in-turn call counted", d["llmCalls"] == 1 and d["estInputTokens"] == 100)

print("\n[3] THE v1 BUG: a call from a DIFFERENT thread is still counted")
b = snap()
t = threading.Thread(target=lambda: bump(4321, 1.0)); t.start(); t.join()
d = delta(b)
ck("cross-thread call counted", d["llmCalls"] == 1 and d["estInputTokens"] == 4321)

print("\n[4] a call from an event loop is counted too (async hook)")
async def go():
    await asyncio.sleep(0)
    bump(777)
b = snap(); asyncio.run(go()); d = delta(b)
ck("async call counted", d["llmCalls"] == 1 and d["estInputTokens"] == 777)

print("\n[5] concurrent turns are flagged as inexact, not silently wrong")
b1 = snap(); b2 = snap()          # two turns overlap
bump(500)
d2 = delta(b2); d1 = delta(b1)
ck("overlap flagged on both", d1["llmCallsExact"] is False and d2["llmCallsExact"] is False)
b3 = snap(); d3 = delta(b3)
ck("solo turn exact again", d3["llmCallsExact"] is True)

print("\n[6] zero-call turn is representable (the 'hook never fired' signal)")
b = snap(); d = delta(b)
ck("zero delta", d["llmCalls"] == 0)

print("\n[7] lifetime totals are monotonic and non-negative")
t1 = totals(); bump(10); t2 = totals()
ck("monotonic", t2["llmCalls"] == t1["llmCalls"] + 1)
ck("non-negative", all(v >= 0 for v in t2.values()))

print("\n[8] thread-safe under contention")
b = snap()
ts = [threading.Thread(target=lambda: [bump(1) for _ in range(200)]) for _ in range(8)]
[x.start() for x in ts]; [x.join() for x in ts]
d = delta(b)
ck("no lost updates (8x200)", d["llmCalls"] == 1600)

print("\n[9] v1 thread-local API is fully removed from main.py")
ck("no _meter_begin",  '_meter_begin'  not in src)
ck("no _meter_read",   '_meter_read()' not in src)
ck("no threading.local meter", '_turn_meter' not in src)
ck("async hook is metered", src.count('_llm_counter_bump(est, time.time()') == 2)

print("\nFAILURES:", fail)
sys.exit(1 if fail else 0)
