"""Regression test for PooledAgent's recycle ceilings + per-tier iteration caps,
extracted verbatim from main.py so the logic is tested without importing
FastAPI/httpx/the hermes-agent package (none of which exist in this sandbox)."""
from dataclasses import dataclass, field
from typing import Optional
import time, re

import os
_HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(_HERE, 'main.py'), encoding='utf-8').read()

# pull the real constants out of main.py so the test can't drift from it
POOL_RECYCLE_TURNS = int(re.search(r'POOL_RECYCLE_TURNS = int\(os\.environ\.get\("[^"]+", "(\d+)"\)\)', src).group(1))
POOL_RECYCLE_CHARS = int(re.search(r'POOL_RECYCLE_CHARS = int\(os\.environ\.get\("[^"]+", "(\d+)"\)\)', src).group(1))
MAX_ITERATIONS     = int(re.search(r'MAX_ITERATIONS = int\(os\.environ\.get\("[^"]+", "(\d+)"\)\)', src).group(1))
g = int(re.search(r'"generic": int\(os\.environ\.get\("[^"]+", "(\d+)"\)\)', src).group(1))
i = int(re.search(r'"info":\s+int\(os\.environ\.get\("[^"]+", "(\d+)"\)\)', src).group(1))
MAX_ITER_BY_TIER = {"generic": g, "info": i, "build": MAX_ITERATIONS}
print(f"constants from main.py: turns={POOL_RECYCLE_TURNS} chars={POOL_RECYCLE_CHARS} "
      f"iter={MAX_ITER_BY_TIER}")

@dataclass
class PooledAgent:
    turns: int = 0
    cum_prompt_chars: int = 0
    def record_turn(self, prompt_chars: int) -> None:
        self.turns += 1
        self.cum_prompt_chars += max(0, int(prompt_chars))
    def should_recycle(self, next_prompt_chars: int = 0) -> Optional[str]:
        if self.turns >= POOL_RECYCLE_TURNS:
            return f"{self.turns} turns in this room"
        projected = self.cum_prompt_chars + max(0, int(next_prompt_chars))
        if projected >= POOL_RECYCLE_CHARS:
            return f"~{projected // 4000}k tokens of accumulated context"
        return None

def tier_cap(t): return MAX_ITER_BY_TIER.get((t or "").strip().lower(), MAX_ITERATIONS)

fail = 0
def ck(name, cond):
    global fail
    print(("  PASS  " if cond else "  FAIL  ") + name)
    if not cond: fail += 1

print("\n[1] fresh agent never recycles")
p = PooledAgent()
ck("fresh, small prompt -> keep", p.should_recycle(3000) is None)

print("\n[2] turn ceiling")
p = PooledAgent()
for _ in range(POOL_RECYCLE_TURNS - 1):
    ck_ = p.should_recycle(10); p.record_turn(10)
ck(f"at {POOL_RECYCLE_TURNS-1} turns -> keep", p.should_recycle(10) is None)
p.record_turn(10)
ck(f"at {POOL_RECYCLE_TURNS} turns -> recycle", p.should_recycle(10) is not None)

print("\n[3] char ceiling fires BEFORE the turn is paid for")
p = PooledAgent()
p.cum_prompt_chars = POOL_RECYCLE_CHARS - 1000
ck("projected under -> keep", p.should_recycle(500) is None)
ck("projected over  -> recycle", p.should_recycle(2000) is not None)

print("\n[4] the real 143k-token failure would now be prevented")
# observed live: "Used 143383" tokens ~= 573k chars of context
p = PooledAgent(); recycled_at = None
for n in range(1, 40):
    if p.should_recycle(48000):     # ~12k tokens of fresh prompt per turn
        recycled_at = n; break
    p.record_turn(48000)
ck(f"recycled at turn {recycled_at} (before 143k tokens)", recycled_at is not None)
ck("ceiling well under the observed failure",
   POOL_RECYCLE_CHARS/4 < 143383)

print("\n[5] per-tier iteration caps")
ck("generic -> 1",            tier_cap("generic") == 1)
ck("info    -> 4",            tier_cap("info") == 4)
ck("build   -> MAX (30)",     tier_cap("build") == MAX_ITERATIONS == 30)
ck("None    -> MAX (compat)", tier_cap(None) == MAX_ITERATIONS)
ck("junk    -> MAX (compat)", tier_cap("nonsense") == MAX_ITERATIONS)
ck("'INFO'  -> 4 (case)",     tier_cap("  INFO ") == 4)

print("\n[6] worst-case turn cost, before vs after")
before = 30 * 143383
after  = MAX_ITER_BY_TIER['info'] * (POOL_RECYCLE_CHARS // 4)
print(f"  info-tier worst case: {before:,} -> {after:,} input tokens "
      f"({before/after:.0f}x reduction)")
ck("worst case improves >10x", before/after > 10)

print("\nFAILURES:", fail)
raise SystemExit(1 if fail else 0)
