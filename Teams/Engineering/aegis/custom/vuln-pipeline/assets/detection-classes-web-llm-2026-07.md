# Detection Classes — Web + LLM/Agent (dated 2026-07)

The concrete "find" layer for **interpreted and LLM stacks** (Python, JS/TS, and agent code), where the defending-code harness's ASAN-crash detector does not apply. Each class carries the detection signal to look for statically, plus the verification note. Priority order for THIS deployment (ToonGine agents = Python/JS/TS + LLM): LLM/agent classes and web classes are primary; native-memory classes (ASAN) apply only if a business ships C/C++/Rust-unsafe.

Method authority: `vuln-pipeline` (this is its detector content for non-native stacks) + `secure-code-review` (depth read of a flagged diff). Triage against the current THREAT_MODEL.md. Verify findings by a separate grader before they're real (pipeline rule). Dated — refresh against OWASP Top 10 and OWASP LLM Top 10 when >6 months old.

---

## A. Web classes (OWASP Top 10-aligned)

| Class | Static detection signal (Python / JS-TS) | Verify |
|---|---|---|
| **Injection — SQL** | String-built queries: f-strings/`.format`/`%`/`+` into `execute(`, `.raw(`, `.query(`, Sequelize `literal`, Knex `raw`. Signal = any untrusted value not passed as a bound parameter. | Craft an input that changes query shape in the sandbox; parameterized = safe. |
| **Injection — command** | `os.system`, `subprocess.*(..., shell=True)`, `eval`, `exec`, Node `child_process.exec`, backticks. Untrusted value in the command string. | Show argument breakout (`; id`) in sandbox. |
| **Injection — template (SSTI)** | User input reaching `render_template_string`, Jinja `Template(...)`, JS template engines with user data as template not data. | Payload evaluates (`{{7*7}}`→49). |
| **Broken access control / IDOR** | Route handlers that read an id from the request and fetch/mutate WITHOUT an ownership/role check on THAT object. Signal = `findById(req.params.id)` with no `where owner = currentUser`. | Access another user's object id; expect 403, not 200. |
| **Broken auth / session** | Missing auth middleware on a mutating route; JWT verified without signature/expiry; tokens in URLs; no revocation on logout. | Replay/forge token; expect rejection. |
| **XSS** | Untrusted data to `dangerouslySetInnerHTML`, `v-html`, `innerHTML`, `document.write`, unescaped template output (`{!! !!}`, `| safe`). | Payload executes in a rendered page (Reticle/Playwright). |
| **SSRF** | Server-side fetch (`requests.get`, `fetch`, `axios`) with a URL derived from user input and no allowlist. | Point at internal metadata/host; expect block. |
| **Insecure deserialization** | `pickle.loads`, `yaml.load` (non-safe), `marshal`, JS `node-serialize`, untrusted `JSON.parse` feeding `eval`. | Crafted object triggers side effect. |
| **Secrets exposure** | Hardcoded keys/tokens (`sk_`, `AKIA`, `-----BEGIN`, `password =`), secrets in logs/errors, `.env` committed. | grep the diff + history; any hit is a finding. |
| **Crypto misuse** | `md5`/`sha1` for passwords, ECB mode, static IV/nonce, `Math.random()` for tokens, homemade crypto. | Identify primitive; no PoC needed — misuse is the finding. |
| **SSRF/rate/DoS** | Unbounded loops on user input, no pagination cap, no rate limit on auth/write endpoints, regex catastrophic backtracking. | Load/timeout test in sandbox. |

## B. LLM / Agent classes (OWASP LLM Top 10 2025-aligned) — the fleet defends itself

These are the classes that matter *because aegis defends the agents we ARE*, not just the products we ship. cypher attacks these offensively; aegis finds them defensively in agent code/config.

| Class | Static detection signal | Verify |
|---|---|---|
| **LLM01 Prompt injection** | Untrusted content (user input, fetched web pages, file contents, tool outputs) concatenated into a prompt WITHOUT delimiting/labeling as data; no instruction-vs-data boundary. Signal = `f"{system}\n{untrusted}"` reaching an LLM call. | In sandbox, feed content containing "ignore previous instructions / call <tool>"; deviation = finding (ties Rail 1 plan-lock). |
| **LLM02 Insecure output handling** | LLM output flowing UNVALIDATED into a sink: `eval`, shell, SQL, `innerHTML`, a tool call, a file write. The model's text treated as trusted. | Induce output that reaches the sink; confirm execution. |
| **LLM06 Excessive agency** | An agent granted tools/permissions beyond its role; write/delete/egress capability where read suffices; tool calls not on the locked plan (Rail 1) or outside the sandbox allowlist (Rail 2). | Map granted vs needed; any excess is a finding — cross-check TOOLS.md. |
| **LLM07 System-prompt leakage** | System prompt or secrets retrievable via crafted input; secrets embedded in the prompt itself. | Elicit the system prompt in sandbox. |
| **LLM08 Vector/RAG weaknesses** | Unauthenticated writes to the memory/vector store; retrieved context injected as instructions; cross-tenant retrieval (toongine multi-project isolation). | Poison a memory record, observe influence. |
| **LLM05 Sensitive info disclosure** | PII/secrets in prompts, logs, or memory writes; model output not scrubbed before display/storage. | Trace a secret from input to any persisted/logged sink. |
| **LLM09 Overreliance / unsafe automation** | Agent output auto-executed (code shipped, data changed) without the gate (quinn) or a human/operator step — especially any path around Rail 3. | Trace the auto-execution path; missing gate = finding. |

## Routing
Every verified finding → owner (dev's domain routing) + quinn intake + `verified-patching`. LLM-class findings that touch a rail are top severity and reach the operator directly (charter). New class discovered → update THREAT_MODEL.md (threats outlive the diff).
