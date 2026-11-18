import { useState } from 'react'
import { EventProvider, useEvents, type BehaviorEvent } from './context/EventContext'
import { generateLayout, type LayoutSpec } from './lib/gemini'
import { LayoutRenderer } from './renderer/LayoutRenderer'

// ── Inner app (needs EventContext to already be mounted) ──────────────────

function AppInner() {
  const { events, logEvent, clearEvents } = useEvents()

  const [apiKey, setApiKey]         = useState(import.meta.env.VITE_GEMINI_API_KEY ?? '')
  const [query, setQuery]           = useState('')
  const [layout, setLayout]         = useState<LayoutSpec | null>(null)
  const [activeQuery, setActiveQuery] = useState('')
  const [loading, setLoading]       = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError]           = useState<string | null>(null)
  const [showJson, setShowJson]     = useState(false)
  const [showDebug, setShowDebug]   = useState(false)
  const [preferencesSummary, setPreferencesSummary] = useState('')
  const [retrieved, setRetrieved]   = useState<{ name: string; score: number }[]>([])

  async function handleGenerate(overrideQuery?: string) {
    if (!apiKey.trim()) { setError('Paste a Gemini API key above.'); return }
    const q = overrideQuery ?? query
    setLoading(true)
    setError(null)
    setLayout(null)
    setActiveQuery(q)

    // Log search query as a behavior event
    if (q.trim()) {
      logEvent({ event: 'SEARCHED', item: q.trim(), sport: 'general', timestamp: new Date().toISOString() })
    }

    try {
      const result = await generateLayout(apiKey.trim(), events, q, setLoadingStep)
      setLayout(result.layout)
      setPreferencesSummary(result.preferencesSummary)
      setRetrieved(result.retrievedComponents)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed — check your API key.')
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleGenerate()
  }

  const EVENT_COLORS: Record<BehaviorEvent['event'], string> = {
    CLICKED:      'bg-green-100 text-green-700',
    SEARCHED:     'bg-blue-100 text-blue-700',
    EXPANDED:     'bg-purple-100 text-purple-700',
    SCROLLED_PAST:'bg-gray-100 text-gray-400',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">GenUI Intermediate</h1>
            <p className="text-xs text-gray-400">Embeddings · Memory compression · Nested layout</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <input
              type="password"
              placeholder="Gemini API key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowDebug(d => !d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showDebug ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {showDebug ? 'Hide debug' : 'Debug'}
            </button>
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              {loading ? loadingStep || 'Working…' : layout ? 'Regenerate' : 'Generate Layout'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col gap-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search like you would on ESPN — e.g. lacrosse scores, NBA standings, Masters odds…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Search
          </button>
        </div>

        {activeQuery && layout && (
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-gray-500">Layout shaped by:</span>
            <span className="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded">{activeQuery}</span>
            <span className="text-gray-300">+</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{events.length} session events</span>
            {preferencesSummary && (
              <>
                <span className="text-gray-300">+</span>
                <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">compressed memory</span>
              </>
            )}
            <button onClick={() => { setQuery(''); handleGenerate('') }} className="text-gray-400 hover:text-gray-600 ml-1">
              clear query
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        {/* Main 3-column grid (debug panel only shown when toggled) */}
        <div className={`grid gap-5 items-start ${showDebug ? 'grid-cols-[280px_1fr_260px]' : 'grid-cols-[280px_1fr]'}`}>

          {/* Left: live event log */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Session Events</h2>
              {events.length > 0 && (
                <button onClick={clearEvents} className="text-xs text-red-400 hover:text-red-600">clear</button>
              )}
            </div>

            {events.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                <p className="text-xs text-gray-400">
                  Click any component in the layout to log behavior events.
                  Generate a layout first.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                {events.map((e, i) => (
                  <div key={i} className="px-3 py-2 flex items-start gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${EVENT_COLORS[e.event]}`}>
                      {e.event.replace('_', ' ')}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-900 truncate">{e.item}</div>
                      <div className="text-xs text-gray-400">{e.sport}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {events.length >= 10 && (
              <p className="text-xs text-purple-600 bg-purple-50 rounded-lg px-3 py-2 leading-relaxed">
                ⚡ {events.length - 10}+ older events will be compressed into a preference summary on next generate.
              </p>
            )}

            <p className="text-xs text-gray-400 leading-relaxed">
              Clicking components logs real behavior. After 10 events, older history is compressed into a preference summary (hierarchical memory).
            </p>
          </div>

          {/* Center: generated layout */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Generated Layout</h2>
              {layout && (
                <button onClick={() => setShowJson(j => !j)} className="text-xs text-blue-600 hover:underline">
                  {showJson ? 'View render' : 'View JSON'}
                </button>
              )}
            </div>

            {loading && (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <div className="animate-spin w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">{loadingStep}</p>
                <p className="text-xs text-gray-400 mt-1">3-step pipeline running…</p>
              </div>
            )}

            {!loading && !layout && (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
                <p className="text-sm text-gray-400">
                  Type a search or click <strong>Generate Layout</strong><br />
                  <span className="text-xs">Click rendered components to build your behavior history</span>
                </p>
              </div>
            )}

            {!loading && layout && !showJson && <LayoutRenderer layout={layout.layout} />}

            {!loading && layout && showJson && (
              <div className="bg-gray-900 rounded-xl p-4 overflow-auto max-h-[75vh]">
                <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">
                  {JSON.stringify(layout, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Right: debug panel (only when showDebug) */}
          {showDebug && (
            <div className="flex flex-col gap-4">
              {/* Preference summary */}
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Preference Summary</h2>
                {preferencesSummary ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-800 leading-relaxed">
                    {preferencesSummary}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-400">
                    Generated after 10+ events (hierarchical memory compression).
                  </div>
                )}
              </div>

              {/* Retrieved components */}
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Retrieved Components</h2>
                {retrieved.length > 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                    {retrieved.map((r, i) => (
                      <div key={i} className="px-3 py-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-gray-700">{r.name}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 rounded-full bg-blue-200 w-16 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round(r.score * 100)}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{r.score.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-400">
                    Cosine similarity scores appear here after generation.
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  These 10 components (out of 19) were sent to Gemini. The rest were filtered out by semantic retrieval.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Root: wrap in EventProvider ───────────────────────────────────────────

export default function App() {
  return (
    <EventProvider>
      <AppInner />
    </EventProvider>
  )
}
