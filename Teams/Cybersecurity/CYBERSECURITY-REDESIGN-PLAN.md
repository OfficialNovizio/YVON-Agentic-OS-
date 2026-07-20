# Cybersecurity Department — Redesign Plan (v1 DRAFT)

**Status:** DRAFT — for discussion, NOT approved, nothing built (rule 0.1) · **Model directive:** built with **Fable**, never Opus; any spawned sub-agents use Fable · **Owner:** CISO role
**Supersedes/relation:** the catalog's Cybersecurity section — see §1. This is the **enterprise/CISO** security department; it deliberately does NOT re-own the product-security already built in Engineering (aegis, cypher).

---

## 0. One-paragraph summary

Cybersecurity is the CISO office: it secures **the company** — its cloud accounts, its people's access, its data, and its security operations — as distinct from Engineering, which secures **the product it ships**. Five agents: **warden** writes the security law (policy framework, risk register, third-party risk, exceptions), **keyring** owns human & infrastructure identity and access, **bastion** owns cloud/network/endpoint posture and infrastructure vulnerabilities, **cortex** owns security monitoring, detection, and breach incident response, and **veil** owns data classification, privacy, and data-loss prevention. Its signature inversion, mirroring the "never move money" and Rail-3 discipline: **the security department is the most watched and least privileged in the fleet — it detects, assesses, and recommends, but the operator holds the keys and executes privileged changes.** Every risk is owned, treated, or explicitly accepted by the operator/board — never ignored.

---

## 1. Why a separate department (and why the catalog was insufficient)

The catalog listed "Cybersecurity" but conflated two different jobs that this fleet now separates cleanly:

1. **Product/build security already lives in Engineering.** `aegis` (AppSec defense: threat-model → vuln-pipeline → secure-code-review → verified-patching) and `cypher` (caged red team attacking our own apps/agents) own the security of the *code and agents we ship*. `quinn` enforces the Security Charter rails on agents at runtime; `dana` enforces Rail 3 on data. A separate Cybersecurity department that re-owned any of this would duplicate them.

2. **The genuinely unowned gap is enterprise/operational security** — the CISO function: identity & access for *humans* (not agents), cloud/network/endpoint posture, security monitoring & breach response, third-party/vendor risk, data privacy/DLP, and the security policy + risk framework that ties it together. Nobody owns this today.

3. **Two adjacent departments must be bounded, not duplicated.** Governance's `sentinel` monitors *compliance* against locked commitments, and `board` is the risk/fiduciary gate; AI & Agents' `relay` owns *machine* identity (agent tool grants + egress allowlist). Cybersecurity carves against both: it owns *security* risk + *human/infra* identity, and routes acceptance decisions to board. (Full boundaries in §5.)

4. **Same catalog defects as the other redesigns:** no leader, thin roster below the house 4-skill bar, dangling cross-refs. Fixed here: `warden` leads and holds the identity; every agent ≥4 skills; every boundary named.

---

## 2. Department law — the ISMS + the security-safety inversion

Cybersecurity does **not** create a new operator-owned charter that rivals the existing ones. **Precedence stays: Engineering Security Charter ≥ Fleet Charter > Cybersecurity policy > agent configs > convenience.** What warden owns is the **ISMS** (Information Security Management System) — the org-security *policy* layer beneath those charters — plus four non-negotiables flagged charter-grade (operator-adopted):

> 1. **Assume breach; risk-based, evidence-based.** Security decisions follow a maintained risk register, not fear; defense-in-depth, not a single wall.
> 2. **Least privilege for humans, as the fleet has for agents.** keyring applies to people the same doctrine relay applies to agents; access is granted minimally, reviewed on cadence, revoke-then-appeal.
> 3. **The security department holds no keys and executes no privileged change.** It detects, assesses, and *recommends*; the **operator** provisions/deprovisions access, runs containment, and remediates infra — mirroring "never move money" and Rail 3. A security agent that could silently change production access or isolate systems would itself be the largest attack surface. This inversion is the department's spine.
> 4. **Every risk is owned, treated, or explicitly accepted — never ignored.** Risk acceptance above a threshold routes to **board** (Governance); precedent archives; silent risk acceptance is an incident.

Material security-policy changes route through the Fleet Charter Rail 3 path (anneal → board) like any fleet change.

---

## 3. The team — 5 agents in 5 pods

| Pod | Agent | Role | Core skills (all custom C unless noted; ≥4 each) |
|---|---|---|---|
| **Governance & Risk** | **warden** ⭐ (leader, identity) | CISO — writes the ISMS law | security-policy-framework (control catalog mapped to the operator's chosen standard — NIST CSF / ISO 27001 / SOC 2, as config) · risk-register (asset → threat → likelihood×impact → treatment: mitigate/accept/transfer/avoid; acceptance→board) · third-party-risk (vendor/SaaS security assessment; data-processing terms; the supply-chain the business depends on) · security-exception-process (time-boxed, compensating-control, expiry — fail-closed like edge/scout) |
| **Access** | **keyring** | Identity & Access Management (humans + infra) | identity-lifecycle (joiner-mover-**leaver**; deprovisioning is the loudest gap) · access-reviews (periodic least-privilege recertification; revoke-then-appeal, relay's cadence for people) · privileged-access-management (admin/root/break-glass; just-in-time) · secrets-governance (vaulting, rotation, no-secrets-in-code — shared rule with aegis/ops) |
| **Infrastructure** | **bastion** | Cloud / network / endpoint posture | cloud-posture (CSPM: misconfig detection on the cloud accounts — public buckets, open ports, over-permissive infra IAM; per stack-profile hosting) · hardening-baselines (CIS-style config baselines: OS, cloud, endpoints) · infra-vuln-management (OS/cloud/infra CVE cadence — boundary: ops patches *app deps*, bastion patches *infra/OS*) · network-security (segmentation, firewall/security-group policy, zero-trust access) |
| **Operations** | **cortex** | Security operations — detect & respond | detection-engineering (log sources, detection use-cases, false-positive tuning — gauge's baseline discipline, security edition) · security-monitoring (SIEM interface, alert triage + severities) · security-incident-response (breach/compromise IR: detect→contain→eradicate→recover→lessons; distinct from ops's outages; joint when both) · threat-hunting (hypothesis-driven proactive search) |
| **Data Protection** | **veil** | Data privacy & protection | data-classification (PII/sensitivity tiers → handling rules; feeds dana + mia storage) · privacy-by-design (DPIA for new features; coordinates spec/loom) · data-loss-prevention (sensitive-data egress monitoring; with cortex) · breach-notification (regulatory clocks — e.g. GDPR 72h; with cortex IR + board + future Legal) |

⭐ = leader (identity holder). Every non-leader has an empty `identity/` (README stub), per house convention. Total: **5 agents, ~20 custom skills**, plus marketplace candidates searched-and-queued for scout at build (playbook 4.1–4.4).

**warden's identity proposal:** archetype *risk-owning-CISO* — assume-breach, defense-in-depth, "the answer is a risk decision, not a yes/no," allergic to security-theater and to holding keys it doesn't need. Archetype-only (meta/spec precedent); named inspiration left to the operator.

---

## 4. The operating loop (how enterprise security is mechanized)

```
warden (ISMS: policy framework + risk register + control mapping to the chosen standard)
   │  defines what "secure" means for THIS business (security profile: crown-jewel assets, obligations)
   ▼
POSTURE  ── keyring (who can access what — least privilege, reviewed)
           bastion (cloud/network/endpoint hardened, infra patched)
           veil (data classified, privacy-by-design, DLP)
   │  each DETECTS gaps → RECOMMENDS → the OPERATOR executes the privileged change (inversion §2.3)
   ▼
WATCH  ── cortex (monitoring + detection rules over the log sources the above expose)
   │        security alert → triage → security-incident-response
   │        (breach/compromise; JOINT with ops when it's also an outage)
   ▼
RESPOND ── contain (operator-run) → eradicate → recover → LESSONS
   │        lessons → warden's risk register + control updates
   │        agent-side compromise → quinn/aegis (the product-security half)
   ▼
GOVERN ── risk acceptance above threshold → board (Governance) · precedent archives
          material policy change → anneal → board (Fleet Charter Rail 3)
```

The department's exhaust feeds the fleet's annealing loop: a real security incident is a baseline failure for some control's policy text (warden), an access gap (keyring), or a detection blind spot (cortex).

---

## 5. Cross-department boundaries (share, don't duplicate) — the critical section

- **vs aegis / cypher (Engineering):** they own **product/code** security (app vulns, red-teaming our own apps/agents); Cybersecurity owns **enterprise** security (company, cloud, people, data). A vuln in shipped code → aegis; a public S3 bucket on the hosting account → bastion. A prompt-injection of an agent → cypher/aegis; a phished employee laptop → cortex. cortex's *breach* IR and aegis's *vuln* fix meet when an incident spans both.
- **vs quinn (Engineering):** quinn enforces the Security Charter rails on **agents at runtime** (plan-lock, sandbox, Rail 3); warden sets **org security policy** for humans + infra. warden's ISMS references the charters as the agent-layer implementation; they align, don't overlap.
- **vs relay (AI & Agents):** relay owns **machine identity** — agent tool registry, egress allowlist, least-privilege grants for *agents*. keyring owns **human + infra identity**. One doctrine (least privilege), two subjects; explicit split, shared cadence.
- **vs sentinel + board (Governance):** sentinel monitors **compliance** against locked commitments; warden owns **security risk + controls**. GRC overlap resolved: sentinel = compliance evidence/monitoring; warden = security policy/risk; **security risk-acceptance decisions route to board**, precedent archives. Cybersecurity *feeds* Governance, never duplicates it.
- **vs ops (Engineering):** ops owns **reliability** incidents (outage) and patches **app dependencies** (maintenance-hygiene); cortex owns **security** incidents (breach) and bastion patches **infra/OS/cloud**. A ransomware event is both → joint IR, ops leads recovery, cortex leads eradication/forensics.
- **vs dana (Engineering):** dana designs the data stores; veil **classifies** the data and sets protection/retention rules dana implements; bastion secures the store's network/access exposure. Rail 3 still holds — none of them executes destructive data ops.
- **vs future depts:** Legal & Compliance (breach-notification legal obligations — veil coordinates), Risk & ESG (enterprise risk feeds it), People & Culture (the joiner-mover-leaver signal keyring consumes). Boundaries stated now, bound when those build.

---

## 6. Genericization + rule-0.6 notes

- Strip venture names; per-business config is a **security profile** (`<FILL_IN>`: crown-jewel assets, compliance obligations, cloud accounts/providers, employee-roster source, chosen control standard, risk-acceptance threshold).
- **Standard is the operator's choice** (NIST CSF / ISO 27001 / SOC 2 / CIS) = config; the control *method* is portable, the *mapping* binds per business.
- 0.6-flagged until a security-management source lands: risk-scoring scales (likelihood×impact), review cadences, alert severities, patch SLAs, DPIA thresholds. Every such value carries the flag.
- **Logical wants:** a security-risk-management text (NIST/ISO-aligned) for warden; an incident-response/DFIR text for cortex; an IAM/zero-trust text for keyring. Risk-scoring math could share the fleet statistics book.

---

## 7. Build order (foundation-first)

1. **warden** (leader + identity + the ISMS law: policy framework, risk register — everything else is scoped by the risk register).
2. **keyring** (identity is foundational — who can touch anything).
3. **bastion** (the posture the monitoring watches).
4. **cortex** (detection + IR — consumes keyring's access model and bastion's log sources).
5. **veil** (data privacy — classifies what everything else protects).
6. **DEPARTMENT-WORKFLOW.md** (only after all five).

Cadence per playbook: marketplace-search-first per skill (scout runs the searches — SOC/detection, IAM, CSPM, DPIA skills are likely candidates), present sources, build one agent, audit (venture-grep + structure + any tested scripts), present, continue.

**Candidate tested scripts (where math/logic warrants):** a risk-scoring/prioritization calculator (warden — likelihood×impact→treatment ranking), and possibly an access-review diff (keyring — entitlements vs baseline → over-grants). Flagged as candidates, confirmed at build.

---

## 8. Open decisions for the operator (answer before build)

1. **Confirm scope = enterprise/CISO only** (not re-owning aegis/cypher's product security)? Rec: yes — that's the whole point of a separate department.
2. **5 agents, or lean to 3–4?** Rec: 5 (warden/keyring/bastion/cortex/veil) for a business holding customer data + cloud + employees. Leaner option: fold **veil** into warden and make **bastion** dormant-until-cloud-exists, giving a 3-agent core (warden/keyring/cortex) that grows. Your call on the business's actual footprint.
3. **warden's identity:** archetype *risk-owning-CISO*, archetype-only — or name an inspiration?
4. **Control standard:** which framework anchors the policy mapping — NIST CSF, ISO 27001, SOC 2, or CIS? (Config either way; picking one now sharpens warden's framework skill.)
5. **The security-safety inversion (§2.3):** confirm the security department holds **no keys** and the operator executes all privileged changes (provisioning, containment, remediation)? Rec: yes — it's the department's spine.
6. **Agent names:** warden / keyring / bastion / cortex / veil — approve, or reskin? (No collisions with existing agents checked: aegis/cypher/quinn/relay/sentinel/board are all distinct.)
