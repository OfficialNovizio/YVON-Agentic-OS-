"""Test the payload-composition recorder against realistic request bodies."""
import os, re, sys, json, threading, time
from collections import deque
from typing import Any, Optional

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'main.py'), encoding='utf-8').read()
blk = src[src.index('_shape_lock = threading.Lock()'):src.index('def _meter_snapshot')]
ns: dict = {'threading': threading, 'deque': deque, 'json': json, 'time': time,
            'Any': Any, 'Optional': Optional}
exec(compile(blk, '<lifted>', 'exec'), ns)
rec, first = ns['_record_payload_shape'], ns['_first_shape_since']

class Req:
    def __init__(self, content): self.content = content

fail = 0
def ck(n, c):
    global fail
    print(("  PASS  " if c else "  FAIL  ") + n); 
    if not c: fail += 1

# a payload shaped like the real one: 31 tools, big schemas, small message
tools = [{"type": "function", "function": {
            "name": f"tool_{i}", "description": "x" * 300,
            "parameters": {"type": "object", "properties": {"a": {"type": "string", "description": "y" * 200}}}}}
         for i in range(31)]
msgs = [{"role": "system", "content": "S" * 4000},
        {"role": "user", "content": "In one sentence: 502 vs 504?"}]
body = json.dumps({"model": "m", "tools": tools, "messages": msgs}).encode()

print(f"\nsynthetic body: {len(body):,} bytes  (~{len(body)//4:,} tokens)")
t0 = time.monotonic()
rec(Req(body))
sh = first(t0)

print("\n[1] shape is captured")
ck("returned", sh is not None)
ck("31 tools counted", sh["toolCount"] == 31)
ck("messages counted", sh["messageCount"] == 2)

print("\n[2] the split is what we need to see")
print(f"    tools    {sh['toolSchemaChars']:,} chars ({sh['toolSchemaPct']}%)")
print(f"    system   {sh['systemChars']:,} chars")
print(f"    messages {sh['messageChars']:,} chars")
ck("tool schemas dominate", sh["toolSchemaPct"] > 50)
ck("system chars found", sh["systemChars"] == 4000)
ck("total matches body", sh["totalChars"] == len(body))

print("\n[3] time filtering — only shapes AFTER a snapshot are attributed")
t_later = time.monotonic()
ck("nothing after a later mark", first(t_later) is None)
rec(Req(json.dumps({"tools": [], "messages": [{"role":"user","content":"hi"}]}).encode()))
sh2 = first(t_later)
ck("new shape found", sh2 is not None and sh2["toolCount"] == 0)

print("\n[4] never raises on junk")
for bad in [b'', b'not json', json.dumps([1,2,3]).encode(),
            json.dumps({"tools": "wrong", "messages": None}).encode(), None]:
    try:
        rec(Req(bad)); ok = True
    except Exception as e:
        ok = False; print("   raised:", e)
    ck(f"survives {str(bad)[:22]!r}", ok)

print("\n[5] oversized bodies are skipped, not parsed")
t3 = time.monotonic()
rec(Req(b'{"a":1}' + b'x' * 9_000_000))
ck("8MB+ skipped", first(t3) is None)

print("\n[6] both hooks record")
ck("2 call sites", src.count('_record_payload_shape(request)') == 2)

print("\nFAILURES:", fail); sys.exit(1 if fail else 0)
