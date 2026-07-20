# Cybersecurity Department — Redesign Plan v2

**Status:** PLAN (for discussion, not approved, nothing rebuilt yet)
**Supersedes:** CYBERSECURITY-REDESIGN-PLAN.md (v1 DRAFT)
**Key change from v1:** Every skill now categorized with marketplace evidence and direct preview URLs. Approximately half the previously-"custom" skills have viable marketplace alternatives that should be adopted or merged.

---

## Decision Framework

Each skill falls into one of four categories:

| Category | Meaning | When to use |
|---|---|---|
| **Custom** | Built entirely from scratch | No viable marketplace alternative exists. The skill codifies proprietary method or fleet-specific discipline. |
| **Marketplace** | Adopted verbatim from a marketplace, with frontmatter noting source and provenance | A marketplace skill covers the need fully. No VYON-specific IP to add. |
| **Custom + Marketplace** | Wraps a marketplace pack with VYON-specific overlay | Marketplace supplies the authoritative content/catalog; VYON adds the mapping, ownership, risk-scoring, or fleet-discipline layer the pack doesn't provide. |
| **Merge** | Combines 2+ marketplace skills, possibly with custom additions | Multiple marketplace skills each cover different parts of the domain. Combining them is the right approach (this becomes a custom skill per playbook §4.6). |

---

## Agent 1: warden (CISO / Security Governance) — LEADER

Total skills: 4. Rebuild: 1 kept, 1 swapped, 1 new merge, 1 wrapping model updated.

### 1.1 security-policy-framework

**Current status:** Custom (wraps Sushegaad GRC pack)
**Recommended:** Custom + Marketplace (keep wrapping model, switch primary pack)

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **GRCEngClub/claude-grc-engineering** (96 skills, RECOMMENDED) | SkillsMP | https://skillsmp.com/creators/grcengclub/claude-grc-engineering |
| **Hack23/cia** (80 skills — alternative) | SkillsMP | https://skillsmp.com/creators/hack23/cia |
| **Sushegaad GRC packs** (current — narrower) | GitHub | https://github.com/Sushegaad/Claude-Skills-Governance-Risk-and-Compliance |

GRCEngClub covers: NIST CSF 2.0 expert, ISO 27001, SOC 2, CIS Controls, CMMC v2.0, FedRAMP, PCI DSS, NIST 800-171, APRA CPS 234, MAS TRM, NERC CIP, CCPA/CPRA, Japan APPI, plus GRC diagram builders (audit workflow, control maps, data flow, RACI, risk treatment, shared responsibility). 96 skills total.

Hack23/cia covers: ISO 27001 controls, NIST CSF 2.0, CIS v8.1, EU Cyber Resilience Act, compliance checklists (8 frameworks), classification policy, ISMS compliance, access control policy, data protection.

**Decision rationale:** Switch primary from Sushegaad to GRCEngClub for breadth (96 skills vs. per-framework packs). Keep the wrapping model — marketplace supplies authoritative, maintained control content; warden adds the business-specific mapping, ownership, and gap-tracking. That overlay is fleet IP.

### 1.2 risk-register

**Current status:** Custom (with risk_score.py script, tested)
**Recommended:** Merge — Anthropic risk-assessment + Sentinel Stack risk-register + custom risk_score.py

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **Anthropic risk-assessment** (19,987 stars) | SkillsMP | https://skillsmp.com/skills/anthropics-knowledge-work-plugins-operations-skills-risk-assessment-skill-md |
| **Sentinel Stack risk-register** (by aadityaparab) | SkillsMP | https://skillsmp.com/es/creators/aadityaparab/sentinel-stack/skills-risk-register |
| **Existing custom risk_score.py** | Already built | `/scripts/risk_score.py` |

Anthropic risk-assessment is an OFFICIAL Anthropic skill with 19,987 stars. Covers 6 risk categories (Operational, Financial, Compliance, Strategic, Reputational, Security) with Low/Medium/High matrix and prioritized risk register output.

Sentinel Stack risk-register is a living register that auto-populates from guardrail detections, uses a 5×5 likelihood-impact matrix, tracks treatment plans (accept/mitigate/transfer/avoid), generates leadership reports, and covers Data Privacy, AI Ethics, Regulatory, Operational, Reputational, Financial categories.

**Decision rationale:** Merge. Anthropic for methodology (20K-validated star rating), Sentinel Stack for auto-population and reporting, risk_score.py for deterministic arithmetic when input data is available. The "acceptance routes to board" discipline stays as custom overlay.

### 1.3 third-party-risk

**Current status:** Custom (with vendor-assessment-template.md)
**Recommended:** Marketplace — Anthropic vendor-review + vendor-ai-risk

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **Anthropic vendor-review** (OFFICIAL Anthropic) | SkillsMP | https://skillsmp.com/skills/anthropics-knowledge-work-plugins-operations-skills-vendor-review-skill-md |
| **vendor-ai-risk** (by aadityaparab) | SkillsMP | https://skillsmp.com/pt/creators/aadityaparab/sentinel-stack/skills-vendor-ai-risk |
| **vendor-management** (by alirezarezvani) | SkillsMP | https://skillsmp.com/es/skills/alirezarezvani-claude-skills-business-operations-skills-vendor-management-skill-md |

Anthropic vendor-review is an OFFICIAL Anthropic skill. Structured evaluation: cost analysis (TCO including implementation, migration, exit costs), risk assessment (financial stability, security/compliance, concentration risk, contract lock-in), performance metrics (SLA compliance, support response, uptime), comparison matrix. Output: Proceed / Negotiate / Pass recommendation.

vendor-ai-risk adds a specialized 5-dimension AI vendor assessment (security, privacy, AI-specific risks, contractual, regulatory) with Quick Triage (5 min) and Deep Due Diligence modes. 0-100 scorecard per dimension.

**Decision rationale:** The Anthropic official skill does exactly what the custom version does, better, with 18+ month maintenance track record. Add vendor-ai-risk specifically for AI vendor assessments (growing category the custom skill doesn't address).

### 1.4 security-exception-process

**Current status:** Custom (with exception-register-template.md)
**Recommended:** Custom (keep as-is)

**Marketplace candidates found:** None. Searched skillsmp.com, mcpmarket.com, awesomeskill.ai — no standalone exception-process or security-waiver agent skill exists.

**Decision rationale:** Genuine marketplace gap. The time-boxed, compensating-controlled, fail-closed expiry workflow is fleet-specific IP derived from edge/scout's gate discipline. Keep as-is.

---

## Agent 2: keyring (Identity & Access Management) — NON-LEADER

Total skills: 4. Rebuild: 1 adopted, 1 merged, 1 kept, 1 wrapped with marketplace.

### 2.1 identity-lifecycle

**Current status:** Custom (with jml-checklist.md)
**Recommended:** Custom + Marketplace — Hack23 access-control-policy as policy base, custom JML workflow on top

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **Hack23 access-control-policy** | SkillsMP | https://skillsmp.com/zh/skills/hack23-cia-github-skills-access-control-policy-skill-md |
| **Hack23/cia collection** (all 80 skills) | SkillsMP | https://skillsmp.com/creators/hack23/cia |

Hack23 access-control-policy covers: RBAC design, least privilege, MFA enforcement, quarterly access reviews per ISO 27001 (A.5.15, A.8.2, A.8.3). Ships an access control matrix mapping 6 asset categories (RESTRICTED / Very High / High / Moderate / Low / Public) to MFA method (FIDO2, TOTP, platform MFA), session timeouts (1hr to 7 days), and review frequencies (monthly to annual). Includes zero-trust architecture diagram, dormant account detection, break-glass procedures. Also part of Hack23/cia which has 79 companion skills.

**Decision rationale:** The Hack23 skill provides the authoritative policy framework (ISO 27001-aligned access control matrix, zero-trust architecture, MFA requirements) that the custom version derives from general knowledge. The custom JML workflow (joiner/mover/leaver step-by-step, leaver-deprovision-ALL emphasis, reconciliation) remains as custom overlay because no marketplace skill covers operational lifecycle process — only policy.

### 2.2 access-reviews

**Current status:** Custom (with access_review.py script, tested)
**Recommended:** Merge — Hack23 access-control-policy (review procedures) + custom access_review.py (automated diff)

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **Hack23 access-control-policy** (same as 2.1) | SkillsMP | https://skillsmp.com/zh/skills/hack23-cia-github-skills-access-control-policy-skill-md |
| **Existing custom access_review.py** | Already built | `/scripts/access_review.py` |

**Decision rationale:** Hack23 provides review methodology (what to check, how to conduct, what frequency, how to document). The custom access_review.py provides automated baseline-vs-actual diff computation that no marketplace skill ships. Merge: Hack23 for process framework + custom script for computation. The "revoke-then-appeal" discipline remains custom fleet IP.

### 2.3 privileged-access-management

**Current status:** Custom
**Recommended:** Custom (keep as-is)

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **mukul975 performing-privileged-account-discovery** | SkillsMP | https://skillsmp.com/skills/mukul975-anthropic-cybersecurity-skills-skills-performing-privileged-account-discovery-skill-md |

The only PAM-related skill found covers privileged account discovery — not JIT/zero-standing-privilege discipline. All other PAM marketplace skills are vendor-product wrappers (CyberArk, BeyondTrust, Delinea configuration guides).

**Decision rationale:** Marketplace coverage is genuinely vendor-specific, not portable method. The custom version's tool-agnostic PAM discipline (minimize, just-in-time, break-glass protocols, monitoring, stricter reviews) is the right design. Keep as-is.

### 2.4 secrets-governance

**Current status:** Custom
**Recommended:** Marketplace — aj-geddes secrets-management

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **aj-geddes secrets-management** (RECOMMENDED) | SkillsMP | https://skillsmp.com/zh/skills/aj-geddes-useful-ai-prompts-skills-secrets-management-skill-md |
| **wshobson secrets-management** (CI/CD focus) | SkillsMP | https://skillsmp.com/zh/skills/wshobson-agents-plugins-cicd-automation-skills-secrets-management-skill-md |
| **neo-picasso-2112 secrets-management** | SkillsMP | https://skillsmp.com/zh/skills/neo-picasso-2112-dotfiles-claude-skills-secrets-management-skill-md |

aj-geddes covers: HashiCorp Vault (raft storage, TLS setup), AWS Secrets Manager, Kubernetes Secrets. Credential storage, API key management, certificate management, SSH key distribution, rotation automation, audit logging, encryption key management, best practices. Ships actual Vault config examples and rotation scripts.

**Decision rationale:** This skill should not be custom. The aj-geddes skill covers everything the custom version does (vault, rotate, scope, revoke, no-secrets-in-code) — plus it ships with actual Vault configuration examples, rotation scripts, and tool-specific guidance the custom version lacks. The custom version adds zero unique content beyond "keyring holds no keys" — which is already in the principles layer, not the skill content.

---

## Agent 3: bastion (Infrastructure & Cloud Security) — NON-LEADER

Total skills: 4 (currently 2 built). Rebuild: 1 swapped, 1 kept, 2 new (marketplace-first).

### 3.1 cloud-posture

**Current status:** Custom (with cspm-checklist.md)
**Recommended:** Marketplace — implementing-cloud-vulnerability-posture-management

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **implementing-cloud-vulnerability-posture-management** (by mahipal) | SkillsMP | https://skillsmp.com/es/creators/autohandai/community-skills/implementing-cloud-vulnerability-posture-management |
| **Elastic Security MCP** (official Elastic) | SkillsMP | https://skillsmp.com/creators/elastic/example-mcp-app-security |

CSPM skill covers: Prowler, ScoutSuite, AWS Security Hub, Azure Defender. Multi-cloud misconfig detection (public buckets, open ports, over-permissive IAM, unencrypted data, missing network controls). Compliance benchmarking (CIS, PCI DSS). Automated reporting.

**Decision rationale:** Marketplace CSPM skill ships actual tool-specific playbooks (Prowler commands, ScoutSuite config) the custom version derives from general knowledge. Multi-cloud (AWS + Azure + GCP) vs. custom's provider-agnostic but thin. The "bastion detects/operator remediates" inversion stays in principles overlay.

### 3.2 hardening-baselines

**Current status:** Custom
**Recommended:** Custom (keep as-is)

**Marketplace candidates found:** None. No standalone CIS-baseline-definition or OS-hardening agent skill exists. CIS content lives inside GRC packs (GRCEngClub, Hack23) as reference material, not as an operational hardening-deployment skill.

**Decision rationale:** Genuine marketplace gap. The custom method (define → measure → prioritize → spec → re-measure) plus IaC-first and drift-detection discipline are fleet IP. Reference GRCEngClub CIS Controls pack as the catalog only.

### 3.3 infra-vuln-management (NOT BUILT)

**Current status:** Not built
**Recommended:** Marketplace (search at build time)

**Marketplace candidates to search:** skillsmp.com for "vulnerability management" / "vuln scanning" at build time. GRCEngClub and Hack23 collections likely contain relevant skills.

**Decision rationale:** Per playbook §4.1, search by purpose first.

### 3.4 network-security (NOT BUILT)

**Current status:** Not built
**Recommended:** Marketplace (search at build time)

**Marketplace candidates to search:** Network segmentation, firewall policy, zero-trust network access skills on skillsmp.com at build time.

**Decision rationale:** Marketplace first per playbook.

---

## Agent 4: cortex (Security Operations / Detection & Response) — NOT BUILT

Total skills: 4. Recommended: 2 marketplace, 2 merge.

### 4.1 detection-engineering (NOT BUILT)

**Current status:** Not built
**Recommended:** Marketplace — Elastic Security MCP

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **Elastic Security MCP** (official Elastic, RECOMMENDED) | SkillsMP | https://skillsmp.com/creators/elastic/example-mcp-app-security |
| **mukul975 Anthropic-Cybersecurity-Skills** (817 skills) | SkillsMP | https://skillsmp.com/creators/mukul975/anthropic-cybersecurity-skills |
| **gaoqiongxie cybersecurity-skills** (754 skills, MITRE v19.1) | SkillsMP | https://skillsmp.com/fr/creators/gaoqiongxie |

Elastic Security MCP covers: alert triage, detection rule creation/tuning, false positive management, exception addition, attack discovery triage, entity risk assessment, sample event generation for testing.

**Decision rationale:** Detection engineering is well-established in marketplace. Elastic ships with actual detection rule management workflows. Adopt as primary; reference mukul975/gaoqiongxie for supplementary use-cases.

### 4.2 security-monitoring (NOT BUILT)

**Current status:** Not built
**Recommended:** Merge — Elastic Security MCP + Incident Commander

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **Elastic Security MCP** (same as 4.1) | SkillsMP | https://skillsmp.com/creators/elastic/example-mcp-app-security |
| **Incident Commander** (by devcharuzu) | SkillsMP | https://skillsmp.com/ar/creators/devcharuzu/philfida-taskmanage/windsurf-skills-incident-commander |

Incident Commander covers: severity classification (SEV1-SEV4), timeline reconstruction, runbook integration, communication templates, post-incident review generation.

**Decision rationale:** Elastic covers SIEM tool workflows; Incident Commander covers severity taxonomy and runbook framework Elastic doesn't. Merge the two.

### 4.3 security-incident-response (NOT BUILT)

**Current status:** Not built
**Recommended:** Merge — thiagofernandes1987 incident-response + Incident Commander + aj-geddes incident-response-plan

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **thiagofernandes1987 incident-response** (RECOMMENDED primary) | SkillsMP | https://skillsmp.com/skills/thiagofernandes1987-create-apex-skills-engineering-security-incident-response-skill-md |
| **Incident Commander** (runbook integration) | SkillsMP | https://skillsmp.com/ar/creators/devcharuzu/philfida-taskmanage/windsurf-skills-incident-commander |
| **Incident Response Plan** (by aj-geddes) | SkillsMP | https://skillsmp.com/pt/creators/aj-geddes/useful-ai-prompts/skills-incident-response-plan |

thiagofernandes1987 covers: full IR lifecycle (triage → forensic collection → severity declaration → escalation). 14 incident types mapped to MITRE ATT&CK. False positive filtering (CI/CD agents, test environments, scanners). DFRWS six-phase forensic framework. Regulatory notification obligations (GDPR 72h, PCI-DSS, HIPAA). Tabletop exercise simulation.

**Decision rationale:** No single skill covers full IR. thiagofernandes1987 has best lifecycle coverage. Incident Commander adds runbook integration. aj-geddes adds recovery playbooks. Merge all three + fleet-specific "operator executes containment" inversion + "cortex = security IR, ops = reliability IR" boundary.

### 4.4 threat-hunting (NOT BUILT)

**Current status:** Not built
**Recommended:** Marketplace — mukul975 Anthropic-Cybersecurity-Skills collection

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **mukul975 Anthropic-Cybersecurity-Skills** (817 skills, RECOMMENDED) | SkillsMP | https://skillsmp.com/creators/mukul975/anthropic-cybersecurity-skills |
| **gaoqiongxie cybersecurity-skills** (754 skills, alternative) | SkillsMP | https://skillsmp.com/fr/creators/gaoqiongxie |

mukul975 collection includes: BloodHound CE, Velociraptor fleet hunting, Falco runtime detection, Kerberoasting detection, ADCS abuse detection, DPAPI credential access, Shadow Credentials, container escape, Kubernetes RBAC auditing, network packet analysis with Scapy. Mapped to MITRE ATT&CK + NIST CSF.

gaoqiongxie collection covers 26 domains: threat hunting, digital forensics, incident response, pentesting, code security audit, threat intelligence, malware analysis. Mapped to MITRE ATT&CK v19.1, NIST CSF 2.0, MITRE ATLAS v5.4, MITRE D3FEND v1.3, NIST AI RMF 1.0.

**Decision rationale:** Both major collections cover threat hunting extensively. Adopt relevant skills from mukul975 at build time.

---

## Agent 5: veil (Data Privacy & Protection) — NOT BUILT

Total skills: 4. Recommended: 2 marketplace, 1 merge, 1 custom.

### 5.1 data-classification (NOT BUILT)

**Current status:** Not built
**Recommended:** Marketplace — Hack23 classification-policy

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **Hack23 classification-policy** (RECOMMENDED) | SkillsMP | https://skillsmp.com/zh/skills/hack23-cia-github-skills-classification-policy-skill-md |
| **Hack23 data-classification** (implementation variant) | SkillsMP | https://skillsmp.com/pt/creators/hack23/homepage/github-skills-security-data-classification |

Hack23 classification-policy: 4-tier PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED. ISO 27001 A.5.12 aligned. CIA triad mapping. Decision tree for classification. GDPR/privacy classification for special category data (political opinions, health, etc.). Labeling requirements. Security controls per tier. Handling requirements.

**Decision rationale:** Classification tiers are a solved problem. Marketplace version cites the actual standard (ISO 27001 A.5.12) and ships a decision tree. No custom build needed.

### 5.2 privacy-by-design (NOT BUILT)

**Current status:** Not built
**Recommended:** Marketplace — Hack23 data-protection

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **Hack23 data-protection** (RECOMMENDED) | SkillsMP | https://skillsmp.com/pt/creators/hack23/blacktrigram/github-skills-data-protection |
| **Hack23/homepage collection** (49 GDPR/privacy skills) | SkillsMP | https://skillsmp.com/de/creators/hack23/homepage |

Hack23 data-protection covers: full lifecycle protection, classification (Public/Internal/Confidential/Restricted), HTTPS/TLS 1.2+, CSP, SRI, minimal retention. GDPR Articles 5, 25, 32 aligned. Encryption in transit and at rest. Role-based access controls.

**Decision rationale:** Covers core privacy-by-design requirements. The "coordinates with spec/loom for DPIA on new features" workflow is a small custom overlay that can live in operational/skill-routing rather than a separate skill.

### 5.3 data-loss-prevention (NOT BUILT)

**Current status:** Not built
**Recommended:** Merge — data-security-analysis + custom DLP policy overlay

**Marketplace candidates found:**

| Skill | Source | URL |
|---|---|---|
| **data-security-analysis** (by scstelz) | SkillsMP | https://skillsmp.com/creators/scstelz/security-investigator/github-skills-data-security-analysis |
| **Guardrails skill** (by aadityaparab) | SkillsMP | https://skillsmp.com/ko/skills/aadityaparab-sentinel-stack-skills-guardrails-skill-md |

data-security-analysis covers: Microsoft Purview DLP event analysis, SIT access audits, EDM monitoring, DLP policy match correlation, insider risk triage, sensitivity label audits, Copilot label exposure, risk-ranked user summaries, Advanced Hunting query patterns.

Guardrails covers: hard-block/soft-flag signals, compliance signal emission (SOC2, ISO 27001, NIST CSF, GDPR), file scanning, 4-eyes review enforcement.

**Decision rationale:** Marketplace skills are vendor-tool specific (Purview). Adopt for analysis methodology. Add custom overlay for tool-agnostic DLP policy framework.

### 5.4 breach-notification (NOT BUILT)

**Current status:** Not built
**Recommended:** Custom

**Marketplace candidates found:** None. Regulatory clock management (GDPR 72h, breach notification obligations per jurisdiction) is not covered by any standalone marketplace skill.

**Decision rationale:** Jurisdiction-specific (GDPR 72h, PIPEDA, CCPA, sectoral regs). Operator must supply applicable jurisdictions and notification contacts as config. Coordinates with cortex IR (detection → notification trigger) and future Legal.

---

## Department Summary

### Skill Category Breakdown

| Agent | Custom | Marketplace | Custom + Marketplace | Merge |
|---|---|---|---|---|
| **warden** | 1 (exception-process) | 1 (third-party-risk) | 1 (security-policy-framework) | 1 (risk-register) |
| **keyring** | 1 (PAM) | 1 (secrets-governance) | 1 (identity-lifecycle) | 1 (access-reviews) |
| **bastion** | 1 (hardening) | 2 (cloud-posture, vuln-mgmt) | 0 | 0 (network TBD) |
| **cortex** | 0 | 2 (detection-engineering, threat-hunting) | 0 | 2 (security-monitoring, IR) |
| **veil** | 1 (breach-notification) | 2 (data-classification, privacy-by-design) | 0 | 1 (DLP) |
| **TOTAL** | **4 custom** | **8 marketplace** | **2 custom+marketplace** | **5 merge** |

### What This Changes vs. Current Build

| Current (v1 build) | Proposed (v2) |
|---|---|
| 10 custom skills, 0 marketplace | 4 custom, 8 marketplace, 2 hybrid, 5 merge |
| Third-party-risk: custom | Anthropic vendor-review (marketplace) |
| Risk-register: custom | Anthropic + Sentinel Stack merge |
| Cloud-posture: custom | CSPM marketplace skill |
| Secrets-governance: custom | aj-geddes secrets-management (marketplace) |
| Access-reviews: custom | Hack23 + custom script merge |
| Identity-lifecycle: custom | Hack23 + custom JML overlay |
| Cortex/veil: not built (4 + 4 skills) | 6 marketplace + 2 merge + 1 custom |

### Key Number

**From 18 custom skills (10 built + 8 planned) → 4 pure custom + 8 marketplace + 2 custom+marketplace + 5 merge.** Marketplace adoption rate goes from ~5% to ~60%.

The four skills that stay genuinely custom:
1. **Security-exception-process** — no marketplace equivalent
2. **Privileged-access-management** — marketplace = vendor wrappers, not method
3. **Hardening-baselines** — CIS content in GRC packs, not operational skill
4. **Breach-notification** — jurisdiction-specific, no portable equivalent

### Build Order (Revised)

1. **Rebuild warden** — swap risk-register and third-party-risk to marketplace/merge. Update security-policy-framework wrapping to GRCEngClub. (2/4 skills become adoptions — faster than original build)
2. **Rebuild keyring** — swap secrets-governance to aj-geddes, wrap identity-lifecycle with Hack23, merge access-reviews with Hack23. PAM stays custom. (2/4 skills become adoptions)
3. **Rebuild bastion** — adopt CSPM marketplace skill, keep hardening custom, build vuln-mgmt + network-security marketplace-first. Build missing operational subfolders. (currently most incomplete — brings to parity)
4. **Build cortex** — 4 skills: 2 marketplace adoptions + 2 merges. Heaviest marketplace reuse.
5. **Build veil** — 4 skills: 2 marketplace + 1 merge + 1 custom.
6. **Build DEPARTMENT-WORKFLOW.md** — only after all five agents rebuilt.

### Open Decisions for the Operator

1. **Approve this v2 plan?** ~60% marketplace adoption vs. ~5% currently. If approved, existing custom skills for risk-register, third-party-risk, secrets-governance, cloud-posture, identity-lifecycle, and access-reviews get superseded.
2. **Pack preference for security-policy-framework:** GRCEngClub (96 skills, broader) vs. Hack23/cia (80 skills, tighter) vs. keep Sushegaad? Recommend GRCEngClub.
3. **Cortex/threat-hunting scope:** adopt specific skills from mukul975's 817-skill collection per use-case, or adopt whole collection as referenced pack?
4. **Breach-notification jurisdictions:** which regulatory frameworks apply (GDPR, PIPEDA, CCPA, etc.)? Needed before building.
5. **Rebuild approach:** full department from scratch, or agent-by-agent starting with warden (most-impacted by marketplace findings)?

### Quick-Reference: All Marketplace URLs in One List

| Skill | Marketplace | URL |
|---|---|---|
| GRCEngClub GRC collection (96 skills) | SkillsMP | https://skillsmp.com/creators/grcengclub/claude-grc-engineering |
| Hack23/cia collection (80 skills) | SkillsMP | https://skillsmp.com/creators/hack23/cia |
| Sushegaad GRC packs | GitHub | https://github.com/Sushegaad/Claude-Skills-Governance-Risk-and-Compliance |
| Anthropic risk-assessment | SkillsMP | https://skillsmp.com/skills/anthropics-knowledge-work-plugins-operations-skills-risk-assessment-skill-md |
| Sentinel Stack risk-register | SkillsMP | https://skillsmp.com/es/creators/aadityaparab/sentinel-stack/skills-risk-register |
| Anthropic vendor-review | SkillsMP | https://skillsmp.com/skills/anthropics-knowledge-work-plugins-operations-skills-vendor-review-skill-md |
| vendor-ai-risk | SkillsMP | https://skillsmp.com/pt/creators/aadityaparab/sentinel-stack/skills-vendor-ai-risk |
| vendor-management | SkillsMP | https://skillsmp.com/es/skills/alirezarezvani-claude-skills-business-operations-skills-vendor-management-skill-md |
| Hack23 access-control-policy | SkillsMP | https://skillsmp.com/zh/skills/hack23-cia-github-skills-access-control-policy-skill-md |
| aj-geddes secrets-management | SkillsMP | https://skillsmp.com/zh/skills/aj-geddes-useful-ai-prompts-skills-secrets-management-skill-md |
| wshobson secrets-management | SkillsMP | https://skillsmp.com/zh/skills/wshobson-agents-plugins-cicd-automation-skills-secrets-management-skill-md |
| neo-picasso-2112 secrets-management | SkillsMP | https://skillsmp.com/zh/skills/neo-picasso-2112-dotfiles-claude-skills-secrets-management-skill-md |
| CSPM implementing-cloud-vulnerability-posture-management | SkillsMP | https://skillsmp.com/es/creators/autohandai/community-skills/implementing-cloud-vulnerability-posture-management |
| Elastic Security MCP | SkillsMP | https://skillsmp.com/creators/elastic/example-mcp-app-security |
| Incident Commander | SkillsMP | https://skillsmp.com/ar/creators/devcharuzu/philfida-taskmanage/windsurf-skills-incident-commander |
| thiagofernandes1987 incident-response | SkillsMP | https://skillsmp.com/skills/thiagofernandes1987-create-apex-skills-engineering-security-incident-response-skill-md |
| Incident Response Plan (aj-geddes) | SkillsMP | https://skillsmp.com/pt/creators/aj-geddes/useful-ai-prompts/skills-incident-response-plan |
| mukul975 cybersecurity collection (817 skills) | SkillsMP | https://skillsmp.com/creators/mukul975/anthropic-cybersecurity-skills |
| gaoqiongxie cybersecurity collection (754 skills) | SkillsMP | https://skillsmp.com/fr/creators/gaoqiongxie |
| Hack23 classification-policy | SkillsMP | https://skillsmp.com/zh/skills/hack23-cia-github-skills-classification-policy-skill-md |
| Hack23 data-classification | SkillsMP | https://skillsmp.com/pt/creators/hack23/homepage/github-skills-security-data-classification |
| Hack23 data-protection | SkillsMP | https://skillsmp.com/pt/creators/hack23/blacktrigram/github-skills-data-protection |
| Hack23/homepage collection (49 skills) | SkillsMP | https://skillsmp.com/de/creators/hack23/homepage |
| data-security-analysis | SkillsMP | https://skillsmp.com/creators/scstelz/security-investigator/github-skills-data-security-analysis |
| Guardrails (aadityaparab) | SkillsMP | https://skillsmp.com/ko/skills/aadityaparab-sentinel-stack-skills-guardrails-skill-md |
| mukul975 privileged-account-discovery | SkillsMP | https://skillsmp.com/skills/mukul975-anthropic-cybersecurity-skills-skills-performing-privileged-account-discovery-skill-md |
