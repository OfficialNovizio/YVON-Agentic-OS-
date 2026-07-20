# Deploy Checklist — ops/release-discipline

> Run in order, every deploy including hotfixes. Host-specific mechanics come from the business's platform-playbook; these steps are invariant.

## Preconditions
- [ ] quinn GATE PASS reference attached (quality verdict)
- [ ] No open rail violation; deploy plan LOCKED (plan id: ___) (security verdict)
- [ ] Change scope matches the locked plan (no drive-by inclusions)

## Rollback (before deploying — blocking)
- [ ] Rollback path identified: previous artifact / down-script / feature-flag-off
- [ ] Rollback EXERCISED in staging (evidence: ___)
- [ ] Data compatibility confirmed (schema N-1 tolerance if migrations involved)

## Migrations (if any — Rail 3)
- [ ] dana's prepared script + plain-language effect summary attached
- [ ] OPERATOR ran it (never an agent, never auto-run by the pipeline)
- [ ] Sequenced expand → migrate → contract; this deploy independently rollback-able

## Deploy
- [ ] Strategy chosen per playbook + risk: blue-green / canary / rolling (recorded)
- [ ] Deploy window sane (someone watching; config `deploy_windows` if set)
- [ ] Executed per playbook §___

## Verify (any failure → ROLL BACK NOW, diagnose after)
- [ ] Health checks green
- [ ] Error rate / latency within maintenance-hygiene baselines
- [ ] Smoke of critical flows (config `critical_flows`) passes
- [ ] Watch window held (config `deploy_watch_window`): ___ → CLOSED / ROLLED BACK

## Record
- [ ] Deploy record written (skill Output Format); rollbacks and failures → incident-response if user-facing
