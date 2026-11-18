# Prototype 03 — ESPN Generative UI
## What It Does + INFO 4940 Course Connections

---

## What the prototype does

A user interacts with a generated ESPN-style sports homepage. Clicking sport nav tabs (NFL, NBA, MLB…) immediately fires a **four-step pipeline** that produces a personalized layout hydrated with real live data from ESPN's public API:

1. **Compress** — if history exceeds 10 events, an LLM call compresses older events into a 2–3 sentence preference summary
2. **Retrieve** — `all-MiniLM-L6-v2` embeds a retrieval context (query or history); cosine similarity selects the top 10 most relevant components from the 19-component catalog
3. **Generate (Phase 1)** — Gemini receives the retrieved components + user context and returns a nested JSON layout. Components that display live data include `_dataSource`, `_sport`, and `_league` annotations in their props — these are Gemini's declarations that it needs real data for a specific sport and endpoint
4. **Hydrate (Phase 2)** — the app walks the layout tree, collects all `_dataSource` annotations, groups them by unique (sport, league, endpoint), fires parallel fetches to ESPN's public API, and replaces Gemini's placeholder prop values with real game scores, real headlines, and real standings

The result: a ScoreCard with a real live NBA score and team logos pulled from ESPN's CDN, a NewsHeadline with a real article headline and thumbnail, a StandingsSnapshot with real W-L records — all rendered inside a layout that was personalized to the user's behavioral history.

The debug panel shows the live preference summary, the 10 retrieved components ranked by cosine similarity score, and the full event log.

---

## What's new vs Prototype 02

| Feature | Prototype 02 | Prototype 03 |
|---|---|---|
| Data source | Gemini-generated plausible values | Real ESPN API (scoreboard, news, standings) |
| Pipeline phases | 3 (compress → retrieve → generate) | 4 (compress → retrieve → generate → hydrate) |
| LLM output | Layout JSON | Layout JSON + data retrieval annotations |
| API calls | Gemini only | Gemini + ESPN public API (parallel) |
| Layout update | One-shot, final on render | Two-stage: renders with AI data, updates in place with live data |
| Navigation | Search bar only | Sport nav tabs that auto-trigger generation |
| Visual design | Generic Tailwind cards | ESPN design language — dark headers, red accents, team logos |
| Skeleton loaders | No | Yes — ESPN-style shimmer during Phase 1 |

---

## Course connections (by lecture)

### Lec 08 — RAG, Retrieval, and Memory in LLM Systems

Prototype 03 implements everything in Prototype 02's RAG section, plus a structurally new RAG pattern: **two-phase agentic retrieval**.

**The new pattern: generation-driven retrieval**

In standard RAG (as in Prototype 02), retrieval happens *before* the LLM call — external documents are fetched, injected into the prompt, and the LLM generates over them. Prototype 03 adds a second retrieval phase that is *triggered by* the LLM's output:

```
Phase 1: LLM generates layout → output includes data retrieval annotations
Phase 2: app reads annotations → fetches ESPN API → hydrates layout with real data
```

In `gemini.ts`, the system prompt instructs Gemini:

```
DATA SOURCE ANNOTATIONS (optional — enables real ESPN data):
For ScoreCard, NewsHeadline, StandingsSnapshot, StatTable, HeroSection — you MAY add:
  "_dataSource": "scoreboard" | "news" | "standings"
  "_sport":  ESPN sport name  (e.g. "basketball", "football")
  "_league": ESPN league name (e.g. "nba", "nfl", "mlb")
When present, the app will replace your generated prop values with real live ESPN data.
```

Gemini outputs something like:
```json
{
  "component": "ScoreCard",
  "props": {
    "sport": "NBA",
    "team1": "Lakers", "score1": 112,
    "team2": "Celtics", "score2": 108,
    "status": "Q3 4:22",
    "_dataSource": "scoreboard",
    "_sport": "basketball",
    "_league": "nba"
  }
}
```

The `hydrateLayout` function in `gemini.ts` then walks this tree, finds every `_dataSource` annotation, groups unique requests, fires them in parallel, and calls `setLayout(updated)` as each resolves — updating the rendered layout in place with real data.

This is called **generation-driven retrieval** or **agentic RAG**: instead of retrieval informing generation, *generation plans retrieval*. The LLM decides what external data is needed; the application executes those retrieval actions. The lecture covered standard RAG (retrieve → generate); this prototype adds the inverse direction (generate → retrieve → update).

**The same three RAG patterns from Prototype 02 are still present:**
- Behavioral history injected into prompt (RAG #1)
- Embedding-based component retrieval via cosine similarity (RAG #2)
- Hierarchical memory compression for long event histories (RAG #3)

---

### Lec 09 — LLM Agents and Tool Use

**The `_dataSource` annotation IS tool use — implemented manually.**

Tool use in modern LLM APIs (Anthropic's tool_use, OpenAI's function_calling) follows this exact pattern:
1. Developer defines a set of tools with schemas
2. LLM generates a response that includes structured "I need to call this tool with these arguments" declarations
3. Application executes the tool call and returns results to the LLM
4. LLM produces a final response using the tool results

Prototype 03 implements this pattern end-to-end without using the SDK's built-in tool mechanism:

| Tool use (standard SDK) | Prototype 03 |
|---|---|
| Developer defines tool schemas | `_dataSource`, `_sport`, `_league` documented in system prompt |
| LLM emits `tool_use` block with arguments | Gemini emits `_dataSource`/`_sport`/`_league` in props |
| App executes tool call | `hydrateComponent(dataSource, sportLeague, index)` in `espnApi.ts` |
| Results returned to LLM | Results merged directly into layout props and re-rendered |

The key difference from standard tool use: the results aren't fed back to the LLM for a second generation — they're applied directly to the already-rendered UI. This is appropriate for a layout system where the structure is already correct and only the data values need updating.

The system prompt acts as the tool schema definition. Gemini's reliability at following it (emitting properly structured annotations in the right components) is a direct result of instruction tuning via RLHF — the same mechanism from Lec 07. Without instruction tuning, a base language model would either ignore the annotation format or produce annotations on every component indiscriminately.

**Why annotations are on props, not a separate field**

A clean tool-use implementation would have a separate `toolCalls: []` field in the Gemini output. Here, annotations are embedded in component props for a practical reason: the constrained JSON decoding (`responseMimeType: 'application/json'`) applies to the entire output, so Gemini generates a single valid JSON object. Adding a parallel `toolCalls` array would require a more complex schema definition and prompt. The embedded approach is simpler to specify and equally functional for this use case.

**The `hydrateLayout` parallel dispatch loop**

```typescript
await Promise.all(
  sources.map(async ({ path, dataSource, sportLeague, index }) => {
    const hydrated = await hydrateComponent(dataSource, sportLeague, index)
    if (!hydrated) return
    current = { layout: applyHydration(current.layout, path, hydrated) }
    onUpdate(current)   // re-renders layout as each fetch completes
  })
)
```

This is an **asynchronous tool dispatch loop** — all tool calls fire in parallel, and the UI updates incrementally as each resolves. This is the same execution model as concurrent tool calls in the Anthropic and OpenAI SDKs.

---

### Lec 08 (continued) — Search vs. Feed mode

Prototype 03 inherits search vs. feed mode from Prototype 02:

```
has query  → retrieval_context = query only
no query   → retrieval_context = preference_summary + recent_events
```

Prototype 03 adds a third mode: **nav tab trigger**. When a user clicks "NBA," the tab logs a `NAV` event and calls `handleGenerate("NBA basketball scores news standings")`. This synthesized query acts as a search query — it drives retrieval toward NBA-relevant components and labels history as background context. The behavior is identical to the user typing "NBA" in the search bar.

This reflects the RAG design principle from lecture: the retrieval context must match the user's actual intent. A nav-tab click is a strong intent signal (this user wants NBA content right now) and should dominate retrieval, not be diluted by their lacrosse history.

---

### Lec 06 — Embeddings, Cosine Similarity, and the Transformer

All embedding mechanics are identical to Prototype 02:
- `all-MiniLM-L6-v2` via Transformers.js (ONNX, runs locally in browser)
- 384-dimension output vectors with mean pooling and L2 normalization
- Cosine similarity (equivalent to dot product for normalized vectors)
- Top-10 component selection before the Gemini call

The only difference is the retrieval context when a nav tab is clicked:

```typescript
const retrievalContext = hasQuery
  ? query!.trim()                               // "NBA basketball scores news standings"
  : [preferencesSummary, recentEvents].join()  // history-driven feed mode
```

When you search "fantasy football start sit injury update waiver wire," the embedding of that query lands near the FantasyAlert and InjuryReport component descriptions in the 384-dimensional space — those components score highest in cosine similarity and get included in the top-10 sent to Gemini. You can verify this directly in the debug panel after generation.

---

### Lec 07 — Instruction Tuning and RLHF

**The data annotation schema is a complex instruction**

The system prompt in Prototype 03 defines two simultaneous output requirements: the nested JSON layout schema (from Prototype 02) AND the optional `_dataSource`/`_sport`/`_league` annotation format. Gemini reliably:
1. Produces valid nested JSON
2. Adds data annotations on appropriate components (ScoreCard, NewsHeadline, StandingsSnapshot) for major pro sports
3. Omits annotations for components and sports where they don't apply (FantasyAlert, lacrosse scores)
4. Includes realistic fallback prop values alongside the annotations

This reliability at multi-constraint instruction following is the product of RLHF. A base language model would not distinguish between components that warrant live data vs. those that don't — instruction tuning trained the model to interpret the instruction's intent, not just pattern-match the format.

**`responseMimeType: 'application/json'` and constrained decoding**

Same as Prototype 02: at each sampling step, tokens that would break JSON validity are masked to zero probability before softmax. This applies over the entire output including the annotation fields. The result is structurally valid JSON even at `temperature: 1.4`.

---

### Lec 01 — LLM Inference and Autoregressive Generation

Prototype 03 runs up to **three** autoregressive generation sequences per request:

1. **Compression call** (if history > 10 events): generates preference summary token by token
2. **Layout + annotation call (Phase 1)**: generates the full nested JSON layout with `_dataSource` annotations token by token
3. **No third LLM call in Phase 2**: the ESPN API fetches are standard HTTP requests, not LLM calls — the data is structured JSON that gets merged directly into the layout without another generation pass

`temperature: 1.4` on the layout call means the logit distribution is flattened before softmax, making lower-probability component orderings and nesting structures more likely. This produces layout variation across regenerations for identical user history — the same reason as in Prototype 02.

The `all-MiniLM-L6-v2` embedding model is an **encoder** (bidirectional attention, processes entire input simultaneously) — no autoregressive token sampling. The ESPN API fetches are deterministic HTTP lookups. Neither contributes autoregressive steps.

---

## The full pipeline, step by step

```
User clicks "NBA" sport tab
  → logEvent({ event: 'NAV', item: 'NBA', sport: 'nba' })
  → handleGenerate("NBA basketball scores news standings")

  ↓
[Step 1 — if events > 10]
  old_events → Gemini (memory.ts) → preference_summary
  all 19 component descriptions → all-MiniLM-L6-v2 → 19 embeddings (cached)

[Step 2 — retrieval, search mode because query present]
  retrieval_context = "NBA basketball scores news standings"   ← query only
  embed(retrieval_context) → all-MiniLM-L6-v2 → context_embedding
  cosine_similarity(context_embedding, component_embeddings[i]) for i in 1..19
  sort descending → top 10: [ScoreCard, StandingsSnapshot, StatTable, NewsHeadline, ...]

[Step 3 — Phase 1: layout generation]
  system prompt = nesting rules + top-10 retrieved component specs + annotation instructions
  user prompt   = history (labeled "background context only") + query + ordering instruction
  → Gemini (temperature: 1.4, responseMimeType: 'application/json')
  → JSON layout with _dataSource annotations on ScoreCard, NewsHeadline, StandingsSnapshot

[Step 4 — Phase 2: ESPN data hydration]
  walk layout tree → collect _dataSource annotations:
    ScoreCard      → { dataSource: "scoreboard", sportLeague: "nba" }
    NewsHeadline   → { dataSource: "news",       sportLeague: "nba" }
    StandingsSnapshot → { dataSource: "standings", sportLeague: "nba" }

  fire in parallel:
    fetch("/espn/basketball/nba/scoreboard") → transform → real teams, scores, logos
    fetch("/espn/basketball/nba/news")       → transform → real headline, image URL
    fetch("/espn/basketball/nba/standings")  → transform → real W-L records

  as each resolves: applyHydration(layout, path, realProps) → setLayout(updated)
  → UI updates in place, replacing Gemini's placeholder values with live ESPN data

[Render]
  LayoutRenderer.render(spec) — recursive, same as Prototype 02
    cleanProps() strips all _ prefixed keys before passing to React components
    Section → collapsible, logs EXPANDED
    Tabs    → logs CLICKED tab
    leaves  → wrapped in onClick loggers

User clicks ScoreCard → CLICKED event logged → loop continues
```

---

## What the ESPN API is and why no auth is needed

`https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/{endpoint}`

This is ESPN's internal public API — the same endpoints ESPN's own website and mobile app use. No API key, no authentication. The available endpoints used here:

| Endpoint | Used by |
|---|---|
| `/{sport}/{league}/scoreboard` | ScoreCard, HeroSection |
| `/{sport}/{league}/news` | NewsHeadline, HeroSection |
| `/{sport}/{league}/standings` | StandingsSnapshot, StatTable |

The Vite dev server proxies `/espn/*` → `https://site.api.espn.com/apis/site/v2/sports/*` to avoid browser CORS restrictions. This proxy is dev-only — a deployed version would need a backend proxy or serverless function.

Components whose data doesn't map to these three endpoints (InjuryReport, BettingOdds, PlayerSpotlight, FantasyAlert, VideoHighlight, etc.) always render Gemini's generated placeholder values — there is no live ESPN feed for betting odds, fantasy recommendations, or per-player injury status in this public API.

---

## File map

```
src/
├── context/
│   └── EventContext.tsx        — session event store, adds NAV event type
├── lib/
│   ├── componentCatalog.ts     — 22 components with _dataSource schema hints
│   ├── embeddings.ts           — all-MiniLM-L6-v2 (identical to Prototype 02)
│   ├── memory.ts               — preference compression (identical to Prototype 02)
│   ├── espnApi.ts              — ESPN fetch functions + data transformers
│   └── gemini.ts               — 4-step pipeline + hydrateLayout tree walker
├── components/
│   ├── *.tsx                   — 19 leaf components (ESPN visual design)
│   ├── Skeleton.tsx            — shimmer skeleton loader
│   └── containers/
│       ├── Section.tsx         — dark header, ESPN red left border
│       ├── Tabs.tsx            — red active tab underline
│       └── CardRow.tsx         — grid layout
└── renderer/
    └── LayoutRenderer.tsx      — recursive renderer, cleanProps() strips _ keys
```
