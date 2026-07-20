# cortex — Tool Requirements

**Specifies needs; does not grant them.** Access configured at deployment (Fleet Charter Rails 1–2). Every external call plan-locked + sandboxed.

| Skill | Needs | Why |
|---|---|---|
| detection-engineering | SIEM read access (Elastic/Splunk API); file read/write | Fetch alerts, manage rules, document tuning |
| security-monitoring | SIEM read access; case management (if available); file read/write | Triage queue, case tracking |
| security-incident-response | File read/write; evidence storage (file system); forensics tool access if available | IR documentation, evidence preservation |
| threat-hunting | Log source read access (endpoint, network, cloud); hunting tool CLIs (if available) | Data queries, tool execution |

## Explicit non-needs / hard prohibition (the security-inversion)
- **NO execute access to containment tools** (firewall, EDR isolate, IAM suspend, cloud block). cortex recommends containment; the operator executes.
- **NO write access to production systems or security controls.** cortex writes case files and investigative notes only.
- **No SIEM write access** for rule changes — detection rules are modified through the operator or change management gate.

## Notes
- cortex is the detection and response brain; it has read access to everything and write access to almost nothing.
- SIEM read access is the single most important technical dependency — without it, operations are manual.
