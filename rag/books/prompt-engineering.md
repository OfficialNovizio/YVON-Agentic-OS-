---
name: rag-prompt-engineering
type: rag/books — design rationale grounded in source books
date: 2026-07-16
books_applied:
  - Ogilvy, David, Ogilvy on Advertising (1983)
  - Heath, Chip & Dan, Made to Stick (2007) — Books/ folder
  - Berger, Jonah, Contagious (2013) — Books/ folder
  - Cialdini, Robert, Influence (1984) — Books/ folder
---

# Prompt Engineering — Grounding RAG Chunk Construction

## Purpose

Every chunk injected into an agent's context window is a communication act. The books that govern how humans communicate persuasively — Ogilvy, Heath, Berger, Cialdini — apply equally to how an AI receives context. A well-engineered prompt doesn't tell the model MORE. It tells it the RIGHT THING, in the RIGHT ORDER, with CITABLE AUTHORITY.

---

## Principle 1 — Specificity Over Generality

**Source:** Ogilvy, *Ogilvy on Advertising*, Ch.1, p.20

> "The more informative your advertising, the more persuasive it will be. Generalities roll off the understanding like water from a duck. Specific facts stick."

**Applied to RAG chunks:**

A chunk that says "Principles are important for maintaining quality standards" is wasted context. A chunk that says "Principle #3 — No Fabrication: Never invent a data point, dollar figure, or survey result that isn't operator-supplied" is useful context.

**Implementation rule:** Every injected chunk must contain at least ONE specific, verifiable fact. If a chunk can be replaced with "be good at your job" without losing information, it doesn't belong in the context window.

**Chunker enforcement:** The chunker already sections documents by heading and preserves structured content. The context optimizer adds the specificity filter: if a chunk has no numeric claim, no citation, no named entity, and no actionable instruction → deprioritize below tier 3.

**Test:** "If I injected ONLY this chunk and nothing else, could the agent make a specific, defensible decision?" If no → filter out or compress further.

**Shared OS script:** `competitive_strategy.py` — `five_forces_summary()` demonstrates exactly this principle. Every force has a numeric score with a citable rationale. No generalities. The same discipline applies to every RAG chunk.

---

## Principle 2 — Commander's Intent

**Source:** Heath, *Made to Stick*, Ch.1 (Simple)

> "Commander's Intent: If you do nothing else, you must do X. It's the single most important thing, stripped of all context and detail."

**Applied to RAG chunks:**

A heading like "## Principles" followed by 8 bullet points is a document section, not Commander's Intent. The model receives 8 rules when it needs the ONE that matters for this specific task.

**Implementation rule:** The context optimizer should identify the Commander's Intent of each chunk — the ONE sentence or instruction that must survive even if everything else is stripped. This is the first line injected. Supporting context follows.

**Chunker enhancement:** Long principle lists and instruction blocks should be sub-chunked. Each principle gets its own chunk with its own metadata. "Principle #3 — No Fabrication" should be retrievable independently from "Principle #1 — No Spin."

**Heath, Ch.1, p.28:** "Finding the core means stripping an idea down to its most critical essence. To get to the core, you've got to weed out the elements that are important but not critical."

**Shared OS script:** `planning_fallacy.py` — `bayesian_blend()` is Commander's Intent in code. One formula. One output. No ambiguity. Every injected chunk should strive for this level of clarity.

---

## Principle 3 — Authority Before Message

**Source:** Cialdini, *Influence*, Ch.6 (Authority)

> "Display credentials BEFORE the message. A 3-minute introduction of the speaker's credentials produced significantly higher compliance than no introduction."

**Applied to RAG context injection:**

When a chunk is injected, the source citation should come FIRST — not as a footnote. The model should see "Ogilvy, Ch.5, p.71:" before it sees "five times as many people read the headline as the body copy." The authority primes the model to trust the information.

**Implementation rule:** Chunks injected by CIE should be formatted as:

```
[SOURCE: Ogilvy, Ogilvy on Advertising, Ch.5, p.71]
RULE: Headlines should be under 10 words and include the brand name.
```

NOT as:

```
Headlines should be under 10 words. (Ogilvy, Ogilvy on Advertising, Ch.5, p.71)
```

The difference is subtle but measurable. Cialdini tested it. Authority first → higher compliance.

**Shared OS script:** `ogilvy-creative-code.md` — the entire document is structured as rule → citation → test. Every chunk from this file already follows the authority-first pattern. The CIE builder should preserve this structure in injection, not flatten it.

---

## Principle 4 — Practical Value (Actionability)

**Source:** Berger, *Contagious*, Ch.5 (Practical Value)

> "People share practical information to help others. Sharing useful content strengthens social bonds."

**Applied to RAG chunks:**

A chunk that describes a concept without telling the agent what to DO with it fails Berger's Practical Value test. "Brand equity has four dimensions" is information. "When evaluating creative work, score the brand association dimension of the Aaker framework against the current campaign's distinctive assets" is actionable.

**Implementation rule:** Every injected chunk must answer: "What can the agent DO with this?" If the answer is "nothing" or "know this fact," the chunk either needs reformulation or shouldn't be injected.

**Test:** After injection, the model should produce output that cites the chunk AND applies it to the specific task. If the output repeats the chunk's words without applying them → the chunk failed the Practical Value test.

**Berger, Ch.5, p.164:** "News you can use."

**Shared OS script:** `content_performance.py` — `stepss_score()` is Practical Value in code. It doesn't describe contagion theory. It tells you: given this content and these six dimensions, here's the score. Every chunk should aspire to this level of actionability.

---

## Principle 5 — The Von Restorff Effect (Distinctiveness)

**Source:** Von Restorff (1933), cited in `marketing_laws.py`

> "In a list of similar items, the one that differs is recalled 2-3× more often."

**Applied to RAG context injection:**

If all 8 injected chunks use the same format, the same structure, and the same tone, none of them stand out. The model treats them as equal. But they're not equal. Principle #3 (No Fabrication) is MORE important than Template Note #7.

**Implementation rule:** The most critical chunk in each injection should differ visually from the others. Bolded. Prefixed with `⚠️ CRITICAL`. Separated by whitespace. The Von Restorff effect ensures the model weights it correctly.

**Cialdini's Scarcity connection:** If all chunks look equally important, none of them are important. If only ONE chunk gets the critical marker, the model treats it with appropriate weight.

---

## Design Decisions Traceability

| RAG Design Decision | Book Citation | Why |
|--------------------|---------------|-----|
| Chunks must contain specific, verifiable facts | Ogilvy, Ch.1, p.20 | Generalities are wasted context |
| Commander's Intent first in each chunk | Heath, Ch.1, p.28 | The ONE most critical instruction |
| Source citation before content | Cialdini, Ch.6 | Authority primes compliance |
| Every chunk must answer "what can agent DO?" | Berger, Ch.5, p.164 | Practical Value drives action |
| Critical chunks differ visually from others | Von Restorff (1933) | Distinctiveness drives attention |
| Chunks carry priority tier enforced by optimizer | Pareto (1896) via `marketing_laws.py` | 80% budget to the vital 20% of chunks |
