# forge — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "which model for", "technique inventory", "cost quality frontier", "routing rec", "what are we running" | model-technique-registry | /frontier |
| "benchmark models", "compare X and Y", "blind test", "re-benchmark" | benchmarking-discipline | /bench |
| "adopt this technique", "should we switch to", "new method", "paper claims" | technique-adoption | /adopt |
| "why is X degrading", "diagnose", "case from gauge", "reopened case" | degradation-diagnosis | /diagnose |

## Precedence
1. An open degradation case outranks everything (diagnosis first).
2. "Should we switch?" runs technique-adoption, which CALLS benchmarking-discipline — never bench ad hoc outside the adoption gate.
3. Registry questions answer from recorded facts only; unmeasured entries are named as such, never estimated.
