# Prototype 02 — Intermediate Generative UI
## What It Does + INFO 4940 Course Connections

---

## What the prototype does

A user interacts with a generated sports homepage — clicking ScoreCards, expanding Sections, switching Tabs — and every interaction is logged as a real behavioral event in session memory. When they generate or regenerate, the app runs a **three-step pipeline**:

1. **Compress** — if there are more than 10 events, an LLM call compresses the older ones into a 2–3 sentence preference summary
2. **Retrieve** — the retrieval context is built differently depending on mode (see Search vs. Feed below); all 19 leaf component descriptions are embedded as vectors; cosine similarity selects the top 10 most relevant components
3. **Generate** — Gemini receives only the retrieved components + the user's context and returns a nested JSON layout

The renderer maps that JSON recursively into real React components including interactive containers: **Section** (collapsible, accent-colored), **Tabs** (clickable tab bar), and **CardRow** (2–3 columns side by side). Clicking any component logs a new behavioral event, closing the personalization loop.

The debug panel (toggle in the top bar) shows the live preference summary, the retrieved components ranked by cosine similarity score, and the full event log — making every step of the pipeline visible.

---

## What's new vs Prototype 01

| Feature | Prototype 01 | Prototype 02 |
|---|---|---|
| User history | Hardcoded fake profiles | Real clicks/expands/searches logged per session |
| Component catalog | All 9 in prompt every time | 19 leaf components, top 10 retrieved via embeddings |
| Embedding model | None | `all-MiniLM-L6-v2` running locally in browser (ONNX) |
| Memory | Full history always in prompt | Compressed summary + recent 10 events (hierarchical) |
| Layout structure | Flat array of components | Recursive nesting: Section → CardRow → leaves, Tabs |
| Component count | 9 | 22 (19 leaf + 3 container) |
| Personalization loop | One-shot demo | Real feedback — clicks shape next generation |

---

## Course connections (by lecture)

### Lec 08 — RAG, Retrieval, and Memory in LLM Systems

This prototype implements **three distinct RAG patterns** from the lecture simultaneously.

**RAG #1 — Behavioral history as retrieval corpus**

Every user interaction (CLICKED, SEARCHED, EXPANDED) is stored in session memory. At generation time, the recent events are retrieved and injected directly into the Gemini prompt as context. This is the standard RAG pattern from lecture: an external data store is queried, the relevant content is retrieved, and it augments the generation prompt so the model produces user-specific output rather than a generic response.

```
retrieve(session_events) → inject into prompt → Gemini generates for THIS user
```

**RAG #2 — Embedding-based component retrieval (the explicit retrieval step)**

The 19 leaf component descriptions are a small vector store. Before each generation:
- Each component description is embedded → 19 vectors (cached after first run)
- A retrieval context string is embedded → one vector
- Cosine similarity is computed between the retrieval vector and each component vector
- The top 10 are selected and sent to Gemini; the other 9 are filtered out

This is exactly the retrieval pipeline from Lec 08: documents (components) are embedded offline, a query is embedded at inference time, and nearest-neighbor search selects the most relevant documents to inject into the prompt.

```
embed(retrieval_context) → cosine_similarity(context, component_embeddings) → top-K → prompt
```

In Prototype 01, all components were in the prompt and Gemini chose via attention (implicit, in-context selection). In Prototype 02, the selection happens *before* the LLM call via explicit vector retrieval — this is the architectural difference between "give the model everything" and "retrieve then generate."

**Search mode vs. feed mode — retrieval context differs**

What gets embedded as the retrieval context depends on whether the user searched:

```
has query  → retrieval_context = query only
no query   → retrieval_context = preference_summary + recent_events
```

When a user searches "NBA standings," the components retrieved are those semantically closest to that query (StatTable, StandingsSnapshot, ScoreCard) — not diluted by lacrosse click history. When browsing with no query, history drives retrieval as normal.

The same distinction carries into the generation prompt. In search mode, the history sections are labeled as `"background context — use to inform 'For You' section only"` and the query section includes an explicit layout ordering instruction: query-relevant content must appear first, with history-based content in a collapsible "For You" Section below. In feed mode, there is no ordering constraint and history drives the full layout.

This reflects a real design decision: a search intent and a feed intent are structurally different information needs, and conflating them produces the worst of both — personalized content that buries what the user explicitly asked for.

**Hierarchical memory compression**

When history exceeds 10 events, a secondary LLM call runs before the main generation:

```
old_events (>10) → LLM → preference_summary (2–3 sentences)
preference_summary + recent_10_events → main generation prompt
```

This is the **memory compression** pattern for long-horizon LLM agents discussed in Lec 08. A raw event log grows unboundedly and eventually exceeds the context window. The solution: compress old events into a dense natural-language summary, keep recent events verbatim for recency, and inject both. The debug panel shows this summary live — you can watch it form and update as you accumulate behavior.

This is the same pattern used in multi-turn LLM agents that need to "remember" thousands of past interactions without putting them all in the prompt.

---

### Lec 06 — Embeddings, Cosine Similarity, and the Transformer

**The embedding model: `all-MiniLM-L6-v2`**

This is the exact model used in Lec 06. The Python code from lecture:
```python
from transformers import AutoModel, AutoTokenizer
emb_model_name = "sentence-transformers/all-MiniLM-L6-v2"
emb_model = AutoModel.from_pretrained(emb_model_name)
```

Prototype 02 runs the same model via `@huggingface/transformers` (Transformers.js), which converts it to ONNX and runs it locally in the browser via WebAssembly. Same model, same 384-dimension output vectors, same mean pooling — just running in JavaScript instead of Python.

The cosine similarity in `src/lib/embeddings.ts`:
```typescript
function cosineSimilarity(a: Embedding, b: Embedding): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}
```

This is the same formula from lecture. Because vectors are L2-normalized (the `normalize: true` flag in the embedding call), dot product and cosine similarity are equivalent — the same shortcut covered in class.

**What gets embedded, and why it works**

Component descriptions are written to be semantically rich about *use case*, not just props:

> "Live or final game score for two teams with current game status. Best for active or recently completed games."
> — ScoreCard description in `componentCatalog.ts`

When the user clicks ScoreCards and searches "lacrosse scores," the context embedding lands near this description in the 384-dimensional space. The geometry of the embedding space — where semantically similar text ends up close together — is what makes retrieval work. This is exactly the intuition built in Lec 06.

**Attention at generation time**

When Gemini generates the JSON layout token by token, its attention mechanism cross-attends over the retrieved component descriptions and the user's behavioral context simultaneously. A query like "Cornell vs Penn State Lacrosse [CLICKED]" and "ScoreCard: game score with team1, team2..." produce high attention weights between them, which is why `ScoreCard` appears in the output for lacrosse-heavy history. The attention mechanism is doing in-context reasoning over the already-retrieved component set.

---

### Lec 07 — Instruction Tuning and RLHF

**Why nested JSON output works**

The system prompt in `gemini.ts` defines a complex output schema with three different spec shapes (leaf, container with `children`, Tabs with `props.tabs[].children`), nesting rules, and a full worked example. Gemini reliably produces valid, nested JSON conforming to this schema because of instruction tuning via RLHF.

A base language model (raw next-token prediction from Lec 01) would ignore the schema and generate prose. Instruction-tuned models are trained with RLHF reward signals that reinforce following complex format instructions — exactly the GRPO training loop from Lec 07. The reward model would score outputs higher for valid schema adherence than for schema-violating outputs.

The `responseMimeType: 'application/json'` config additionally applies **constrained decoding** — at each sampling step, tokens that would break JSON validity are masked to zero probability before softmax. This is the logit-masking technique, which is the production-grade version of simply hoping the model follows the format instructions.

**The preference compression call**

The secondary Gemini call in `memory.ts` uses a focused system instruction:

```
"Summarize a user's sports preferences from their behavioral history in 2–3 sentences. Cover: which sports they actively engage with, which they ignore, and any notable patterns."
```

This is instruction tuning in action: the model was trained to follow role + task + constraint prompts like this. The output is reliably a short structured summary, not a list of events, not a poem — because instruction tuning trained the model to interpret and follow this exact type of prompt.

---

### Lec 01 — LLM Inference and Autoregressive Generation

The three-step pipeline produces two separate autoregressive generation sequences per request:

1. **Compression call** (if history > 10): generates the preference summary token by token
2. **Layout call**: generates the full nested JSON token by token

`temperature: 1.4` applies to the layout call. At temperature 0, Gemini would always sample the highest-probability next token — producing the same JSON structure every time. At 1.4, the logit distribution is flattened before softmax, making lower-probability component orderings and layout patterns more likely. The result: different nesting structures, different component selections, and different Section groupings across regenerations despite identical input.

The embedding pipeline runs *outside* both autoregressive sequences — `all-MiniLM-L6-v2` is an encoder model (not decoder), so it processes the entire input simultaneously via bidirectional attention, producing a single fixed-size vector without any sequential token sampling.

---

## The full pipeline, step by step

```
User clicks ScoreCard [lacrosse]
  → logEvent({ event: 'CLICKED', item: 'ScoreCard', sport: 'lacrosse' })
  → appended to session events array (React state)

User types "NBA standings" and clicks Search (or clicks Generate with no query)
  ↓
[Step 1 — if events > 10]
  old_events → Gemini (memory.ts) → preference_summary
  all 19 component descriptions → all-MiniLM-L6-v2 → 19 embeddings (cached)

[Step 2 — retrieval, mode-dependent]
  SEARCH MODE (query present):
    retrieval_context = "NBA standings"   ← query only, history excluded
  FEED MODE (no query):
    retrieval_context = preference_summary + recent_events

  embed(retrieval_context) → all-MiniLM-L6-v2 → context_embedding
  cosine_similarity(context_embedding, component_embeddings[i]) for i in 1..19
  sort descending → top 10 component names

[Step 3 — generation, mode-dependent]
  SEARCH MODE:
    system prompt = nesting rules + top-10 retrieved component specs
    user prompt   = history (labeled "background context only")
                  + query + explicit ordering instruction
                  → Gemini → query content first, "For You" section below

  FEED MODE:
    system prompt = nesting rules + top-10 retrieved component specs
    user prompt   = preference_summary + recent_events (full weight)
                  → Gemini → history-driven layout, no ordering constraint

[Render]
  LayoutRenderer.render(spec) — recursive
    Section → <Section> wrapping rendered children (collapsible, logs EXPANDED)
    CardRow → <CardRow> wrapping rendered children
    Tabs    → process props.tabs → <TabsComponent tabs={renderedTabs} /> (logs tab clicks)
    leaf    → <LeafComponent> wrapped in onClick logger

User clicks rendered Section header → EXPANDED event logged → loop continues
```

---

## File map

```
src/
├── context/
│   └── EventContext.tsx        — session event store (React state, resets on refresh)
├── lib/
│   ├── componentCatalog.ts     — 22 component descriptions (leaf descriptions optimized for embedding)
│   ├── embeddings.ts           — all-MiniLM-L6-v2 via Transformers.js, cosine similarity, session cache
│   ├── memory.ts               — preference compression (secondary Gemini call)
│   └── gemini.ts               — 3-step pipeline: compress → retrieve → generate
├── components/
│   ├── *.tsx                   — 19 leaf components (9 from Prototype 01 + 10 new)
│   └── containers/
│       ├── Section.tsx         — collapsible, logs EXPANDED events via EventContext
│       ├── Tabs.tsx            — tabbed, logs CLICKED tab events via EventContext
│       └── CardRow.tsx         — horizontal grid
└── renderer/
    └── LayoutRenderer.tsx      — recursive render function, wraps leaves in click loggers
```
