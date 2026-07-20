---
name: vendor-ai-risk
type: marketplace (verbatim copy — unaltered per playbook §4.8)
source: aadityaparab / Sentinel Stack
source_url: https://skillsmp.com/pt/creators/aadityaparab/sentinel-stack/skills-vendor-ai-risk
status: verbatim copy of vendor-ai-risk skill
assigned_agent: warden (Cybersecurity / CISO — leader)
fulfills_catalog_entry: supplementary to third-party-risk — AI-specific vendor assessment (CYBERSECURITY-REDESIGN-PLAN-v2 §1.3)
note_from_build: This is a verbatim marketplace adoption, supplementary to the primary Anthropic vendor-review. It adds a specialized 5-dimension AI vendor assessment covering security, privacy, AI-specific risks (training data, model behavior, output ownership), contractual protections, and regulatory compliance. Ships Quick Triage (5 min) and Deep Due Diligence modes with a 0-100 scorecard per dimension.
portable: true
date_added: 2026-07-12
# yvon-compile metadata (auto-derived from skill content 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "1. **Security** — infrastructure security, certifications, data handling, access controls 2."
triggers: [vendor ai risk, is this ai vendor safe, what are the ai-specific risks, does this ai tool comply with our policies]
---

# Vendor AI Risk Assessment

## Introduction
Evaluate third-party AI vendors and tools across five specialized dimensions: security, privacy, AI-specific risks, contractual protections, and regulatory compliance. Designed for the growing category of AI vendor assessments that general vendor review skills don't cover — training data rights, model behavior guarantees, output ownership, and AI-specific regulatory obligations.

## When to Use
- Assessing an AI vendor, LLM API, or AI-powered tool that processes business data.
- "Is this AI vendor safe," "what are the AI-specific risks," "does this AI tool comply with our policies."
- Supplementary to the primary Anthropic vendor-review skill for AI-specific dimensions.

## Modes

### Quick Triage (5 minutes)
A fast red-flag screening for initial procurement filtering. Answers: "Should we spend more time on this vendor, or pass now?"

### Deep Due Diligence (full assessment)
Comprehensive evaluation with detailed risk scorecard (0-100 per dimension) and go/no-go recommendation.

## Five Assessment Dimensions

1. **Security** — infrastructure security, certifications, data handling, access controls
2. **Privacy** — data collection practices, retention, subprocessors, user consent
3. **AI-Specific Risks** — training data provenance, model behavior guarantees, output ownership, bias and fairness, explainability
4. **Contractual Protections** — indemnification, liability caps, SLA commitments, termination rights
5. **Regulatory Compliance** — GDPR, CCPA, AI Act readiness, sector-specific regulations

## Output Format
```
## AI Vendor Assessment: [vendor name]
Triage: [PASS / FLAG / NEEDS REVIEW]
Deep Due Diligence:
  Security: [score/100 · key findings]
  Privacy: [score/100 · key findings]
  AI-Specific: [score/100 · key findings]
  Contractual: [score/100 · key findings]
  Regulatory: [score/100 · key findings]
Overall: [Go / No-Go / Conditional] · Required amendments: [list]
```

## Boundaries
- Use alongside the primary **Anthropic vendor-review** for a complete vendor assessment.
- AI-specific findings feed warden's risk-register.
- Contractual findings coordinate with future Legal department.
