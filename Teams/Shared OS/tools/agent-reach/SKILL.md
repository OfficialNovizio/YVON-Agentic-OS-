# Agent-Reach — web access for agents

## How agents use this

Agent-Reach is a CLI + Python library. After install, agents call:

```bash
# CLI mode — read any URL
agent-reach read https://example.com

# Search Twitter
agent-reach search twitter "query"

# Search GitHub
agent-reach search github "repo"

# Check status
agent-reach doctor
```

Or from Python:

```python
from agent_reach import AgentReach
ar = AgentReach()
result = ar.read("https://example.com")
```

## Platforms (zero-config)

Web, YouTube, GitHub, RSS, V2EX, Exa Search, Bilibili — work immediately.
Twitter/X, Reddit, XiaoHongShu — need cookie/browser login (opt-in).

## VPS note

Lightweight — no persistent service. Only uses RAM when called. Runs on the same VPS as the Hermes wrapper.
