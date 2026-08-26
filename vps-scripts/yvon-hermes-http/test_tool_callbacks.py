"""Regression test for the tool-callback arity fix.

The bug: on_tool_start was declared (name, args_preview) — 2 positional — but
hermes-agent calls it with 3 (tui_gateway/server.py:5335 registers it as
`lambda tc_id, name, args:`). Every call raised TypeError, and the runtime
swallowed it (agent/codex_runtime.py:508), so no tool event ever reached the
dashboard. Zero tool.call rows in the events table, all-time, from this alone.

These normalizers are extracted verbatim from main.py so the test cannot drift.
"""
import os, re, ast, sys
from typing import Optional, Any

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'main.py'), encoding='utf-8').read()

# lift the two normalizers straight out of main.py and exec them standalone
def lift(fn_name):
    m = re.search(r'\n    (def %s\(.*?)\n    def ' % fn_name, src, re.S)
    assert m, f'could not find {fn_name} in main.py'
    body = '\n'.join(l[4:] if l.startswith('    ') else l for l in m.group(1).split('\n'))
    ns = {'Optional': Optional, 'Any': Any}
    exec(compile(body, '<lifted>', 'exec'), ns)
    return ns[fn_name]

_norm_tool_start = lift('_norm_tool_start')
_norm_tool_end   = lift('_norm_tool_end')

fail = 0
def ck(name, got, want):
    global fail
    ok = got == want
    print(("  PASS  " if ok else "  FAIL  ") + name)
    if not ok:
        print(f"         got  {got!r}\n         want {want!r}")
        fail += 1

print("\n[1] THE REAL SIGNATURE — tui_gateway/server.py:5335 -> (tc_id, name, args)")
ck("3-positional", _norm_tool_start(("call_abc123", "terminal", "pwd && whoami"), {}),
   ("terminal", "pwd && whoami", "call_abc123"))

print("\n[2] the old assumed shape still works (older builds)")
ck("2-positional", _norm_tool_start(("terminal", "ls -la"), {}),
   ("terminal", "ls -la", None))

print("\n[3] keyword forms")
ck("kwargs full", _norm_tool_start((), {"tool_call_id": "c1", "name": "read_file", "args": "x.py"}),
   ("read_file", "x.py", "c1"))
ck("kwargs alt names", _norm_tool_start((), {"tc_id": "c2", "tool_name": "patch", "arguments": "d"}),
   ("patch", "d", "c2"))

print("\n[4] degenerate shapes must NOT raise")
ck("1-positional", _norm_tool_start(("terminal",), {}), ("terminal", "", None))
ck("empty",        _norm_tool_start((), {}),            ("tool", "", None))

print("\n[5] args preview is bounded (prompt-injection / log-blowup guard)")
name, args, _ = _norm_tool_start(("c", "terminal", "y" * 5000), {})
ck("clipped to 300", len(args), 300)

print("\n[6] tool_end — anchors on the bool, so position can shift")
ck("4-pos (tc,name,ok,summary)", _norm_tool_end(("c9", "terminal", True, "done"), {}),
   ("terminal", True, "done", "c9"))
ck("3-pos (name,ok,summary)",    _norm_tool_end(("terminal", False, "boom"), {}),
   ("terminal", False, "boom", None))
ck("2-pos (name,ok)",            _norm_tool_end(("terminal", True), {}),
   ("terminal", True, "", None))
ck("kwargs",                     _norm_tool_end((), {"name": "write_file", "ok": False, "summary": "denied"}),
   ("write_file", False, "denied", None))
ck("no bool anywhere",           _norm_tool_end(("terminal", "output text"), {}),
   ("terminal", True, "output text", None))

print("\n[7] parallel calls to the SAME tool get distinct timer keys")
# multi_tool_use.parallel is in this build's tool list, so this is real
a = _norm_tool_start(("call_1", "terminal", "cmd A"), {})
b = _norm_tool_start(("call_2", "terminal", "cmd B"), {})
ck("distinct tool_call_ids", (a[2], b[2]), ("call_1", "call_2"))
ck("keys would not collide", a[2] != b[2], True)

print("\n[8] the handlers themselves are variadic in main.py")
ck("on_tool_start variadic", bool(re.search(r'def on_tool_start\(\*cb_args', src)), True)
ck("on_tool_end variadic",   bool(re.search(r'def on_tool_end\(\*cb_args', src)), True)
ck("no fixed-arity relapse", 'def on_tool_start(name: str, args_preview: str)' in src, False)

print("\n[9] workdir is now named explicitly in the repo prompt")
ck("workdir instruction present", 'workdir=' in src, True)

print("\nFAILURES:", fail)
sys.exit(1 if fail else 0)
