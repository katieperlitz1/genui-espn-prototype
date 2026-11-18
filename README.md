# Generative UI Prototypes

Two prototypes exploring **generative UI**: a sports homepage whose layout is designed by an LLM for each user at runtime, based on their behavioral history, instead of every user seeing the same fixed page.

The LLM never writes code. It returns a declarative JSON layout chosen from an approved component catalog, and a React renderer turns that JSON into the page.

| | [02-intermediate](02-intermediate/) | [03-espn](03-espn/) |
|---|---|---|
| Behavioral memory (real clicks, searches, expands) | ✓ | ✓ |
| Embedding-based component retrieval (all-MiniLM-L6-v2, in browser) | ✓ | ✓ |
| Hierarchical memory compression (second LLM call) | ✓ | ✓ |
| Nested layouts (Section, CardRow, Tabs) | ✓ | ✓ |
| Live data from ESPN's public API | | ✓ |
| Two-phase agentic retrieval (LLM declares data needs, app fetches) | | ✓ |
| ESPN visual design, sport nav tabs, skeleton loaders | | ✓ |

**02-intermediate** establishes the pipeline: compress history → retrieve the most relevant components → generate the layout.

**03-espn** adds a fourth step: Gemini annotates components that need live data (`_dataSource`, `_sport`, `_league`), and the app fetches those ESPN endpoints in parallel and replaces the placeholder values with real scores, headlines, and standings.

Built with React 18, TypeScript, Vite, Tailwind CSS, Gemini 2.5 Flash-Lite, and Transformers.js. Each folder has its own README with run instructions and a `PROTOTYPE.md` with the full technical write-up.

## Run locally

```bash
cd 03-espn          # or 02-intermediate
npm install
cp .env.example .env   # add your Gemini API key
npm run dev
```
