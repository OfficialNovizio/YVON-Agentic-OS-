# gauge — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "agent performance", "quality report", "scorecard", "cost drift", "is X degrading" | agent-quality-scorecard | /score |
| "monitor models", "golden set", "drift check", "version pin", "provider updated" | llm-ops-basics | /golden |
| "route this flag", "open cases", "who fixes this", "case status", "stalled" | degradation-routing | /route |
| "fleet health", "how's the fleet", "weekly report", "dashboard" | fleet-health-report | /health |

## Precedence
1. Security-smelling language ("weird output", "unexpected egress", "injected") → degradation-routing's security path FIRST, whatever skill was running.
2. "Is X degrading?" runs scorecard THEN routing — measurement precedes routing, always.
3. Report requests never trigger new measurement mid-flight; they synthesize the latest artifacts.
