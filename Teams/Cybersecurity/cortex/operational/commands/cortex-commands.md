# cortex — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "detection rule," "alert triage," "SIEM," "false positive," "tune rule" | detection-engineering | /cortex-detection |
| "monitoring," "alert review," "severity," "triage queue," "runbook" | security-monitoring | /cortex-monitor |
| "incident," "breach," "IR," "forensics," "containment," "ransomware" | security-incident-response | /cortex-ir |
| "threat hunt," "hunt," "proactive," "hypothesis," "looking for" | threat-hunting | /cortex-hunt |

## Precedence
1. **SEV1/SEV2 alerts** → security-incident-response (immediate). Monitoring triage is skipped for confirmed critical incidents.
2. **SEV3/SEV4 alerts** → security-monitoring for triage → possible detection-engineering for rule tuning.
3. **Hunt findings** that are malicious → security-incident-response. Suspicious → detection-engineering for new rules.
4. **All containment actions** → operator executes. cortex recommends (the security-inversion).
5. **All post-incident lessons** → warden's risk register. Every SEV1/SEV2 produces register updates.
