import { useState, useCallback } from 'react'
import { EventProvider, useEvents, type BehaviorEvent } from './context/EventContext'
import { generateLayout, hydrateLayout, type LayoutSpec } from './lib/gemini'
import { LayoutRenderer } from './renderer/LayoutRenderer'
import { SkeletonLayout } from './components/Skeleton'

// ── Sport nav tabs ─────────────────────────────────────────────────────────

const SPORT_TABS = [
  { label: 'Home',     query: '' },
  { label: 'NFL',      query: 'NFL football scores news standings' },
  { label: 'NBA',      query: 'NBA basketball scores news standings' },
  { label: 'MLB',      query: 'MLB baseball scores news standings' },
  { label: 'NHL',      query: 'NHL hockey scores news standings' },
  { label: 'Golf',     query: 'golf leaderboard PGA Tour scores' },
  { label: 'Soccer',   query: 'soccer MLS scores news' },
  { label: 'Lacrosse', query: 'lacrosse scores news' },
]

// ── Inner app ──────────────────────────────────────────────────────────────

function AppInner() {
  const { events, logEvent, clearEvents } = useEvents()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [apiKey]                           = useState((import.meta as any).env?.VITE_GEMINI_API_KEY ?? '')
  const [searchQuery, setSearchQuery]      = useState('')
  const [activeTab, setActiveTab]          = useState(0)
  const [layout, setLayout]               = useState<LayoutSpec | null>(null)
  const [activeQuery, setActiveQuery]      = useState('')
  const [loading, setLoading]             = useState(false)
  const [hydrating, setHydrating]         = useState(false)
  const [loadingStep, setLoadingStep]      = useState('')
  const [error, setError]                 = useState<string | null>(null)
  const [showJson, setShowJson]           = useState(false)
  const [showDebug, setShowDebug]         = useState(false)
  const [preferencesSummary, setPreferencesSummary] = useState('')
  const [retrieved, setRetrieved]         = useState<{ name: string; score: number }[]>([])

  const handleGenerate = useCallback(async (overrideQuery?: string) => {
    if (!apiKey.trim()) { setError('API key missing.'); return }
    const q = overrideQuery ?? searchQuery
    setLoading(true)
    setHydrating(false)
    setError(null)
    setLayout(null)
    setActiveQuery(q)

    if (q.trim()) {
      logEvent({ event: 'SEARCHED', item: q.trim(), sport: 'general', timestamp: new Date().toISOString() })
    }

    try {
      const result = await generateLayout(apiKey.trim(), events, q, setLoadingStep)
      setLayout(result.layout)
      setPreferencesSummary(result.preferencesSummary)
      setRetrieved(result.retrievedComponents)

      // Phase 2: hydrate with real ESPN data in background
      if (result.hydrating) {
        setHydrating(true)
        await hydrateLayout(result.layout, (updated) => {
          setLayout(updated)
        }, q)
        setHydrating(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.')
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }, [apiKey, events, logEvent, searchQuery])

  async function handleTabClick(i: number) {
    setActiveTab(i)
    const tab = SPORT_TABS[i]
    if (tab.query) {
      logEvent({ event: 'NAV', item: tab.label, sport: tab.label.toLowerCase(), timestamp: new Date().toISOString() })
    }
    setSearchQuery('')
    await handleGenerate(tab.query)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setActiveTab(0)
      handleGenerate()
    }
  }

  const EVENT_COLORS: Record<BehaviorEvent['event'], string> = {
    CLICKED:      'bg-green-100 text-green-700',
    SEARCHED:     'bg-blue-100 text-blue-700',
    EXPANDED:     'bg-purple-100 text-purple-700',
    SCROLLED_PAST:'bg-gray-100 text-gray-400',
    NAV:          'bg-[#fff0f0] text-[#cc0000]',
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0]">

      {/* ESPN Header */}
      <header className="bg-[#cc0000] sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-white font-black text-2xl tracking-tight leading-none">ESPN</span>
            <span className="text-red-300 text-xs font-bold hidden sm:block">Generative UI</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md flex gap-2">
            <input
              type="text"
              placeholder="Search ESPN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-[#aa0000] placeholder-red-300 text-white text-sm px-3 py-1.5 outline-none focus:bg-[#991111] min-w-0"
            />
            <button
              onClick={() => { setActiveTab(0); handleGenerate() }}
              disabled={loading}
              className="bg-white text-[#cc0000] font-black text-xs px-3 py-1.5 uppercase tracking-wide hover:bg-gray-100 disabled:opacity-50 transition-colors shrink-0"
            >
              Search
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowDebug(d => !d)}
              className={`text-xs font-bold px-2 py-1 uppercase tracking-wide transition-colors ${showDebug ? 'bg-white text-[#cc0000]' : 'text-red-200 hover:text-white'}`}
            >
              Debug
            </button>
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="bg-[#1a1a1a] text-white font-black text-xs px-3 py-1.5 uppercase tracking-wide hover:bg-black disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {loading ? '...' : layout ? 'Regenerate' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Sport nav tabs */}
        <div className="bg-[#1a1a1a] overflow-x-auto">
          <div className="max-w-[1200px] mx-auto px-4 flex items-center">
            {SPORT_TABS.map((tab, i) => (
              <button
                key={i}
                onClick={() => handleTabClick(i)}
                disabled={loading}
                className={`px-4 py-2.5 text-xs font-black uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === i
                    ? 'text-white border-[#cc0000]'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Live data indicator */}
      {hydrating && (
        <div className="bg-[#1a1a1a] text-center py-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-[#cc0000] mr-1.5" />
            Fetching live ESPN data…
          </span>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 py-4">
        {/* Active query pill */}
        {activeQuery && layout && (
          <div className="flex items-center gap-2 text-[10px] mb-3 flex-wrap">
            <span className="text-gray-500 uppercase tracking-wide font-bold">Showing:</span>
            <span className="bg-[#cc0000] text-white font-bold px-2 py-0.5 uppercase tracking-wide">{activeQuery || 'Home'}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">{events.length} events · {retrieved.length} components retrieved</span>
            {preferencesSummary && (
              <span className="text-gray-400">· compressed memory active</span>
            )}
          </div>
        )}

        {error && (
          <div className="bg-[#cc0000] text-white p-3 text-sm font-bold mb-4">{error}</div>
        )}

        {/* 3-column layout: event log | content | debug panel */}
        <div className={`grid gap-4 items-start ${showDebug ? 'grid-cols-[240px_1fr_220px]' : 'grid-cols-[240px_1fr]'}`}>

          {/* Left: event log */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Session Events</h2>
              {events.length > 0 && (
                <button onClick={clearEvents} className="text-[10px] text-[#cc0000] font-bold hover:underline uppercase">clear</button>
              )}
            </div>

            {events.length === 0 ? (
              <div className="bg-white border border-[#e5e5e5] p-6 text-center">
                <p className="text-xs text-gray-400">
                  Click a sport tab or generate a layout to start logging events.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#e5e5e5] divide-y divide-[#f0f0f0] max-h-[65vh] overflow-y-auto">
                {events.map((e, i) => (
                  <div key={i} className="px-3 py-2 flex items-start gap-2">
                    <span className={`text-[9px] font-black px-1 py-0.5 shrink-0 mt-0.5 uppercase tracking-wide ${EVENT_COLORS[e.event]}`}>
                      {e.event.replace('_', ' ')}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs text-[#1a1a1a] font-medium truncate">{e.item}</div>
                      <div className="text-[10px] text-gray-400">{e.sport}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {events.length >= 10 && (
              <p className="text-[10px] text-[#cc0000] bg-[#fff0f0] border border-red-200 px-3 py-2 leading-relaxed font-medium">
                {events.length - 10}+ older events will be compressed on next generate.
              </p>
            )}

            <p className="text-[10px] text-gray-400 leading-relaxed">
              Clicking components logs behavior. Nav tabs auto-trigger generation. After 10 events, history compresses via LLM.
            </p>
          </div>

          {/* Center: generated layout */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Generated Layout</h2>
              {layout && (
                <button onClick={() => setShowJson(j => !j)} className="text-[10px] text-[#cc0000] font-bold hover:underline uppercase">
                  {showJson ? 'View render' : 'View JSON'}
                </button>
              )}
            </div>

            {loading && (
              <div>
                <div className="bg-[#1a1a1a] px-3 py-2 flex items-center gap-2 mb-3">
                  <div className="animate-spin w-3 h-3 border border-[#cc0000] border-t-transparent rounded-full" />
                  <span className="text-xs text-gray-400 font-medium">{loadingStep || 'Running pipeline…'}</span>
                </div>
                <SkeletonLayout />
              </div>
            )}

            {!loading && !layout && (
              <div className="bg-white border border-[#e5e5e5] p-16 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                  Click a sport tab or hit Generate
                </p>
                <p className="text-xs text-gray-300 mt-2">
                  The 3-step pipeline runs: compress → embed → generate → hydrate with live ESPN data
                </p>
              </div>
            )}

            {!loading && layout && !showJson && <LayoutRenderer layout={layout.layout} />}

            {!loading && layout && showJson && (
              <div className="bg-[#1a1a1a] p-4 overflow-auto max-h-[75vh]">
                <pre className="text-[11px] text-green-400 whitespace-pre-wrap font-mono">
                  {JSON.stringify(layout, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Right: debug panel */}
          {showDebug && (
            <div className="flex flex-col gap-4">
              {/* Preference summary */}
              <div>
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Preference Summary</h2>
                {preferencesSummary ? (
                  <div className="bg-white border-l-4 border-[#cc0000] border border-[#e5e5e5] p-3 text-xs text-[#1a1a1a] leading-relaxed">
                    {preferencesSummary}
                  </div>
                ) : (
                  <div className="bg-white border border-[#e5e5e5] p-3 text-xs text-gray-400">
                    Appears after 10+ events (hierarchical memory compression).
                  </div>
                )}
              </div>

              {/* Retrieved components */}
              <div>
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Retrieved Components</h2>
                {retrieved.length > 0 ? (
                  <div className="bg-white border border-[#e5e5e5] divide-y divide-[#f0f0f0]">
                    {retrieved.map((r, i) => (
                      <div key={i} className="px-3 py-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-[#1a1a1a]">{r.name}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1 rounded-none bg-gray-200 w-12 overflow-hidden">
                            <div className="h-full bg-[#cc0000]" style={{ width: `${Math.round(r.score * 100)}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400 w-8 text-right tabular-nums">{r.score.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-[#e5e5e5] p-3 text-xs text-gray-400">
                    Cosine similarity scores appear here after generation.
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  10 of 19 components retrieved via all-MiniLM-L6-v2 embeddings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <EventProvider>
      <AppInner />
    </EventProvider>
  )
}
