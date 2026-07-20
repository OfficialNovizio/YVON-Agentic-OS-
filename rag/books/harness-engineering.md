---
name: rag-harness-engineering
type: rag/books — design rationale grounded in published source books
date: 2026-07-16
books_sourced:
  - Cialdini, Robert B. — Influence: The Psychology of Persuasion (Collins, 2007)
    ISBN: 978-0061241895. Chapter: "Authority: Directed Deference" (pp.157-176).
    Present in Teams/Books/.
  - Heath, Chip & Dan — Made to Stick (Random House, 2007)
    ISBN: 978-1400064281. Chapter 4: "Credible" (pp.130-161).
    Present in Teams/Books/.
  - Berger, Jonah — Contagious: Why Things Catch On (Simon & Schuster, 2013)
    ISBN: 978-1451686579. Chapters: Introduction (STEPPS framework, pp.1-30),
    Social Currency (pp.31-66), Triggers (pp.67-102), Emotion (pp.103-138),
    Public (pp.139-166), Practical Value (pp.167-196), Stories (pp.197-226).
    Present in Teams/Books/.
  - Engineering Security Charter — Teams/Engineering/SECURITY-CHARTER.md
    (Three Rails: plan-lock, sandbox, no destructive DB access).
  - Board governance framework — Teams/Governance/board/
---

# Harness Engineering — Grounding RAG Constraints in Published Work

## Purpose

Harness engineering is the scaffold that prevents RAG from becoming a "trust me, bro" system. It doesn't generate context — it CONSTRAINS what context is allowed. The books that govern persuasion, credibility, and social transmission apply directly to how we verify, authenticate, and present retrieved context.

This document is a rewrite. The previous version cited Kahneman's *Thinking, Fast and Slow* extensively. That book is not in `Teams/Books/`. This version sources every claim from books physically present in the project.

---

## Principle 1 — Source Credibility: The Two Questions (Cialdini)

**Source:** Cialdini, *Influence*, Ch.6, "Authority: Directed Deference" (pp.157-176)

Cialdini's authority chapter opens with Milgram's obedience experiments — the famous study where 65% of ordinary people delivered what they believed were lethal electric shocks to a stranger, simply because a man in a lab coat told them to. The chapter demonstrates that people defer to authority symbols (titles, uniforms, credentials) automatically, without conscious deliberation.

Cialdini's key finding:
> "The extreme willingness of adults to go to almost any lengths on the command of an authority constitutes the chief finding of the study."

But the chapter is not an endorsement of authority — it's a warning. Cialdini documents how con artists exploit authority symbols: the "bank examiner" who wears a three-piece suit, the TV doctor (Robert Young, who played Marcus Welby M.D.) selling coffee, the security guard's uniform that makes 92% of pedestrians obey a stranger. The chapter title's subheading is "Directed Deference" — the point is that deference is *directed*, not earned.

### Cialdini's Two Defensive Questions

Cialdini offers two questions for resisting manipulated authority (p.173):

**Question 1:** *"Is this authority truly an expert?"* — Focus on actual credentials, not symbols. The actor Robert Young has no medical training. The man in the business suit has no special knowledge of traffic safety.

**Question 2:** *"How truthful can we expect the expert to be here?"* — Even genuine experts may have motives to mislead. Vincent the waiter (pp.174-176) demonstrates this: he recommended cheaper dishes to establish trustworthiness, then exploited that trust to sell expensive wine. Appearing to argue against his own interests made him *more* credible, not less.

### Applied to RAG

Cialdini's framework gives us two gates for every chunk entering the context window:

**Gate 1 — Is this source a genuine authority?** A chunk's source file must be traceable. If a chunk claims to cite Ogilvy, the file `ogilvy-creative-code.md` must exist. If it claims a book citation, that book must be in `Teams/Books/` or a verifiable free source. The metadata field `source_file` is not decorative — it is the answer to Cialdini's first question.

**Gate 2 — Is this source presenting truthfully?** Even an authoritative source may be outdated, superseded, or contradicted by a more recent version. The staleness check (from `staleness_economics.py`) and the version comparison (from `case_law_method.py`) answer Cialdini's second question.

**What Cialdini does NOT say:** The previous harness document claimed "Cialdini Ch.6: Authority BEFORE message — citations come first." Cialdini makes no argument about presentation order. His chapter is about the *authenticity* of authority, not its placement in a document. Putting citations first is a design choice — it may be good practice, but it is not grounded in Cialdini.

---

## Principle 2 — Internal Credibility Through Vivid, Verifiable Details (Heath)

**Source:** Heath & Heath, *Made to Stick*, Ch.4, "Credible" (pp.130-161)

The Heaths identify five ways ideas earn credibility without external authorities:

### 2.1 Antiauthorities

**Source passage (pp.137-139):** Pam Laffin was a twenty-nine-year-old mother of two. She started smoking at age ten and developed emphysema by twenty-four. The Massachusetts Department of Public Health made her the centerpiece of an antismoking campaign — not because she was a doctor, but precisely because she wasn't. Greg Connolly, the campaign director, said: "What we've learned from previous campaigns is that telling stories using real people is the most compelling way."

The Heaths' insight: "It can be the honesty and trustworthiness of our sources, not their status, that allows them to act as authorities. Sometimes antiauthorities are even better than authorities."

**Applied to RAG:** A chunk from a frontline practitioner (an agent's operational log, a test failure report, a real campaign postmortem) carries *different* but *not lesser* credibility than a chunk from a published book. The feedback loop records which chunks produce good outcomes — an antiauthority chunk with a strong outcome history should outrank an authority chunk with no track record.

### 2.2 Vivid Details

**Source passage (pp.140-144):** The Darth Vader toothbrush experiment. Jurors given the same arguments about a mother's fitness rated her more favorably when the arguments included concrete, vivid details (her son "uses a Star Wars toothbrush that looks like Darth Vader") versus pallid versions ("she sees to it that her child brushes his teeth"). The details were irrelevant to maternal fitness, but they boosted credibility.

The Heaths' insight: "A person's knowledge of details is often a good proxy for her expertise. But concrete details don't just lend credibility to the authorities who provide them; they lend credibility to the idea itself."

**Applied to RAG:** A chunk that cites a specific page number (Ch.5, p.71) is more credible than one that says "according to Ogilvy." A chunk with a specific computed value ($137,236.03) is more credible than one that says "positive NPV." The strip-to-essentials pipeline should prioritize specificity — the detail survives, the generalization dies.

### 2.3 The Sinatra Test

**Source passage (pp.150-153):** "If you can make it there, you can make it anywhere." Safexpress, an Indian logistics company, won a contract to deliver the *Kaun Banega Crorepati* (Indian *Who Wants to Be a Millionaire*) film reels to theaters across India — requiring next-day delivery to even the most remote locations. One contract proved they could handle any logistics challenge. That's the Sinatra Test.

**Applied to RAG:** A chunk that has produced a correct answer in a high-stakes situation (board fiduciary review, legal compliance check, financial audit) earns a permanent credibility boost. It passed its Sinatra Test. The feedback loop should flag Sinatra-passed chunks distinctly — they're not just high-quality, they're battle-tested.

### 2.4 Testable Credentials

**Source passage (pp.154-159):** "Testable credentials can provide an enormous credibility boost." The Heaths describe Barry Marshall drinking a glass of H. pylori bacteria to prove it causes ulcers — "It tasted like swamp water." The implicit challenge: try it yourself and see. Jim Thompson's "positive coaching" workshop asks skeptical coaches to try one technique for one practice — a low-risk test that often converts skeptics.

**Applied to RAG:** A chunk derived from a Shared OS script (`capital_budgeting.py`, `risk_management.py`) is a testable credential. The formula is executable. The output is verifiable. Anyone can run `python3 Teams/Shared OS/logical/capital_budgeting.py` and reproduce the NPV computation. This is the strongest form of internal credibility — the chunk doesn't ask you to believe it, it shows its work.

---

## Principle 3 — The Outside View (General Concept, No Single Book Source)

The concept of the "inside view" vs the "outside view" is most famously articulated in Kahneman's *Thinking, Fast and Slow* (2011). That book is not in the project. However, the concept itself is a general principle of decision science that appears across multiple published works, including those we do have.

The inside view: making predictions based on the specifics of your own case — your plan, your team, your assumptions. It is optimistic by default because it focuses on what makes this case unique, ignoring what happens in similar cases.

The outside view: making predictions based on statistical regularities from a reference class of similar cases — what actually happened when others attempted similar things.

### Applied to RAG

Retrieval by vector similarity is an inside view — "these chunks are the best match for this query." The problem is that semantically similar chunks create an echo chamber. They reinforce the same perspective.

The adversarial chunk injector in `optimizer.py` implements a form of outside-view correction. It selects one chunk from a DIFFERENT source file, with different framing, that would not have been selected by similarity alone. This is not a "premortem" (which is a specific group exercise where participants imagine a future disaster). It is a calibrated outside-view adjustment — introducing information the inside view would have missed.

The key parameter: the adversarial chunk should come from a source within the agent's authorized domain but outside the similarity-scored top results. It should challenge, not contradict — the difference between "here's another perspective" and "here's the opposite claim."

---

## Principle 4 — Social Transmission: What Survives and Why (Berger)

**Source:** Berger, *Contagious*, Introduction, "Why Things Catch On" (pp.1-30)

Berger's STEPPS framework identifies six principles that drive social transmission:

| Principle | Berger's Definition | Applied to Chunk Quality |
|-----------|-------------------|-------------------------|
| **Social Currency** | "We share things that make us look good" (p.31) | Chunks that contain surprising, insider, or status-enhancing facts are more likely to be acted upon |
| **Triggers** | "Stimuli that prompt people to think about related things" (p.67) | Chunks that connect to the query's immediate context are more useful than abstract chunks |
| **Emotion** | "When we care, we share" (p.103). High-arousal emotions (awe, anger, anxiety) drive action | Chunks that evoke precision and urgency ("Must escalate within 24 hours") are more actionable than neutral ones |
| **Public** | "Making the private public… monkey see, monkey do" (p.139) | Chunks that describe observable behavior (what agents actually do) are more credible than aspirational chunks |
| **Practical Value** | "People like to pass along practical, useful information" (p.167) | Chunks containing specific numbers, thresholds, and procedures have higher practical value |
| **Stories** | "Information travels under the guise of idle chatter" (p.197) | Chunks that embed facts in narrative (case studies, examples, postmortems) are more memorable |

### Berger's Key Insight for RAG

Berger's framework is about why people transmit information. When applied to context injection, it tells us which chunks an agent is most likely to *use* productively — not just *read*, but *act upon*. A chunk that scores high on practical value (specific thresholds), triggers (directly relevant to the query), and emotion (urgency/consequence language) is more valuable than a chunk that scores high on similarity alone.

This framework justifies why the strip-to-essentials pipeline prioritizes imperative rules, specific numbers, and citations: these are the STEPPS elements. They are what makes information *usable* rather than merely *readable*.

---

## Principle 5 — The Three Rails (Engineering Security Charter)

**Source:** `Teams/Engineering/SECURITY-CHARTER.md` — constitution-grade, operator-owned

The Security Charter defines four rails. Three apply directly to RAG:

### Rail 1 — Plan-Lock

> "Before any agent calls an external tool, quinn freezes the agent's execution plan — the ordered list of intended tool calls with their arguments — and records a hash of it. Any tool call not present in the locked plan halts the agent and escalates."

**Applied to RAG:** Retrieval should be plan-locked. Which knowledge sources are queried, which agents can access which departments, and the maximum context budget are all defined BEFORE the query runs. The plan cannot change mid-retrieval. This prevents prompt injection and context poisoning.

**Implementation gap:** The Python RAG pipeline currently has no plan-lock enforcement. The retriever accepts any `agent_id` and `dept` parameter without verifying authorization. This needs a pre-retrieval authorization check using the agent registry from `Teams/`.

### Rail 2 — Sandbox + Egress Allowlist

> "Each external tool call runs inside an isolated sandbox whose network egress is restricted to an explicit allowlist. No data, secret, credential, or generated artifact transfers out except to allowlisted destinations."

**Applied to RAG:** The vector store and embedding computation run locally. No raw chunks leave the machine during retrieval. The only external call is the LLM API — and only the compressed injection text leaves, not the source files. This is architecturally satisfied (Python runs locally) but not programmatically enforced.

**Implementation gap:** No egress audit log confirms that only injection text reached the LLM. A compromised chunk could theoretically include an instruction to exfiltrate data. Plan-lock (Rail 1) is the defense here — if the execution plan specifies exactly which chunks are injected, unauthorized data can't piggyback.

### Rail 3 — No Destructive Data Access

> "No agent has destructive database access, ever. Agents produce scripts; the operator runs them."

**Applied to RAG:** Retrieval is read-only. The chunker writes during indexing, not during retrieval. The feedback loop writes quality scores, not content changes. Source files are never modified by the RAG system. The worst outcome from a bug is a bad quality score — not corrupted or deleted data.

**Implementation gap:** This is architecturally satisfied. The RAG pipeline has no write access to `Teams/` source files. It writes only to `chunks.json` (during indexing), `feedback.jsonl` (during feedback logging), and the SQLite vector store. No enforcement code verifies this at runtime — it's guaranteed by architecture, not by code.

---

## Design Decisions Traceability

| RAG Design Decision | Source Book | Why |
|--------------------|------------|-----|
| Two-question source gate before retrieval | Cialdini, *Influence*, Ch.6, pp.172-174 | "Is this authority truly an expert?" + "How truthful can we expect them to be?" |
| Antiauthority chunks (practitioner logs) weighted equally with authority chunks | Heath, *Made to Stick*, Ch.4, pp.137-139 | Pam Laffin: "the honesty and trustworthiness of our sources, not their status" |
| Specific details survive strip-to-essentials; generalizations die | Heath, Ch.4, pp.140-144 | Darth Vader toothbrush experiment: vivid details boost credibility |
| Sinatra Test for chunk quality (one high-stakes success = permanent boost) | Heath, Ch.4, pp.150-153 | "If you can make it there, you can make it anywhere" |
| Shared OS scripts as testable credentials | Heath, Ch.4, pp.154-159 | Barry Marshall: "It tasted like swamp water" — prove it yourself |
| Adversarial chunk from different source (outside view) | General decision science concept | Similarity-based retrieval creates an inside-view echo chamber; a different-source chunk provides outside-view correction |
| Imperative rules + specific numbers survive compression | Berger, *Contagious*, pp.167-196 | Practical Value: "People like to pass along practical, useful information" |
| Urgency language preserved in strip-to-essentials | Berger, *Contagious*, pp.103-138 | Emotion: high-arousal content drives action |
| Three Security Rails applied to RAG | Engineering Security Charter | Plan-lock, sandbox + egress, read-only |
| Feedback loop: quality scores adjust with outcomes | Heath, Ch.4 (testable credentials) + Berger (Triggers, pp.67-102) | Chunks that produce good outcomes in similar contexts are triggered more often |

---

## What This Document Does NOT Claim

1. **Kahneman's 0.30 calibration weight.** *Thinking, Fast and Slow* is not in `Teams/Books/`. The `calibration_weight()` function in `planning_fallacy.py` uses a 0.30 cap — this is the script author's design choice, not a claim from a cited source. The concept of weighting is valid; the specific number is unverified.

2. **Kahneman's premortem.** The adversarial chunk injector is an outside-view correction, not Klein's premortem procedure. A real premortem is a group exercise where participants independently write failure scenarios. Injecting one chunk from a different source is related but not the same thing.

3. **"Authority BEFORE message."** Cialdini never argues for putting authority before content. He argues for verifying authority before deferring to it. The citation-first format in the injector is a design choice, not a Cialdini citation.

4. **Any book not in `Teams/Books/`.** If a book citation appears in this document, the physical or digital book is present in the project. If a concept from an absent book is used (Kahneman's outside view), it is labeled as a general concept, not attributed with page numbers.

---

## What Still Needs Implementation

| Gap | Description |
|-----|-------------|
| Source authentication gate | No code verifies chunk source file existence, hash integrity, or citation traceability at retrieval time |
| Plan-lock for RAG | No code locks retrieval sources before execution or verifies agent authorization |
| Egress audit log | No log confirms only injection text reached the LLM |
| Multiplicative reliability formula | `compute_chunk_quality()` uses additive scoring; should use `freshness × source_authority × quality_score` |
| Quarantine with operator notification | `min_reliability` filter silently excludes chunks; should log and notify |
| Conflict flag injection | `detect_contradictions()` counts but never injects a "CONFLICT DETECTED" flag into agent context |
