import { GoogleGenerativeAI } from '@google/generative-ai'
import type { BehaviorEvent } from '../context/EventContext'
import { COMPONENT_CATALOG, CONTAINER_COMPONENTS } from './componentCatalog'
import { getComponentEmbeddings, retrieveTopComponents } from './embeddings'
import { compressHistory } from './memory'
import { hydrateComponent } from './espnApi'
import { CONFIG } from './config'

export interface ComponentSpec {
  component: string
  props: Record<string, unknown>
  children?: ComponentSpec[]
}

export interface LayoutSpec {
  layout: ComponentSpec[]
}

export interface GenerateResult {
  layout: LayoutSpec
  retrievedComponents: { name: string; score: number }[]
  preferencesSummary: string
  hydrating: boolean
}

const RECENT_EVENT_LIMIT = 10

function formatEvents(events: BehaviorEvent[]): string {
  return events.map(e => `${e.event}: "${e.item}" [${e.sport}] at ${e.timestamp}`).join('\n')
}

function buildSystemPrompt(retrievedNames: string[]): string {
  const leafEntries = retrievedNames
    .map(name => COMPONENT_CATALOG.find(c => c.name === name))
    .filter(Boolean)

  const containerSection = CONTAINER_COMPONENTS.map(
    c => `${c.name}: ${c.schema}\n  → ${c.description}`
  ).join('\n\n')

  const leafSection = leafEntries.map(
    c => `${c!.name}: ${c!.schema}\n  → ${c!.description}`
  ).join('\n\n')

  return `You are a personalized ESPN sports dashboard layout generator.

OUTPUT FORMAT — return only valid JSON, no other text:
{ "layout": [array of component specs] }

Spec shapes:
• Leaf:     { "component": string, "props": object }
• Section/CardRow: { "component": string, "props": object, "children": [array of specs] }
• Tabs:     { "component": "Tabs", "props": { "tabs": [{ "label": string, "children": [array of specs] }] } }

NESTING RULES:
- Section can contain leaf components and CardRow
- CardRow can only contain leaf components (2–3 per row)
- Tabs can contain leaf components in each tab's children
- Do NOT nest containers inside containers beyond Section → CardRow
- QuickLinks must always be a top-level item, never nested

${CONFIG.forceDatasourceAnnotations
  ? `DATA SOURCE ANNOTATIONS — REQUIRED for NBA, NFL, MLB, NHL:
For ScoreCard, NewsHeadline, StandingsSnapshot, and StatTable — you MUST include all three annotation props whenever the sport is NBA, NFL, MLB, or NHL. Do not skip them.
  "_dataSource": "scoreboard" (ScoreCard) | "news" (NewsHeadline) | "standings" (StandingsSnapshot/StatTable)
  "_sport":  ESPN sport path  (e.g. "basketball", "football", "baseball", "hockey")
  "_league": ESPN league path (e.g. "nba", "nfl", "mlb", "nhl")
The app fetches real ESPN data and replaces your prop values. Always include realistic fallback values in case the live fetch fails.`
  : `DATA SOURCE ANNOTATIONS (optional — enables real ESPN data):
For ScoreCard, NewsHeadline, StandingsSnapshot, StatTable, HeroSection — you MAY add these props:
  "_dataSource": "scoreboard" | "news" | "standings"
  "_sport":  ESPN sport name  (e.g. "basketball", "football", "baseball", "hockey")
  "_league": ESPN league name (e.g. "nba", "nfl", "mlb", "nhl")
When present, the app will replace your generated prop values with real live ESPN data.
Use _dataSource only for major US professional leagues (NBA, NFL, MLB, NHL).
Always include realistic fallback prop values in case the live fetch fails.`}

CONTAINER COMPONENTS (always available):

${containerSection}

LEAF COMPONENTS (semantically retrieved for this user):

${leafSection}

EXAMPLE of a well-structured nested layout with data source annotations:
{
  "layout": [
    { "component": "HeroSection", "props": { "title": "LeBron Scores 50 in Overtime Win", "subtitle": "Lakers 128 – 124 Celtics • Final", "badge": "TRENDING", "sport": "basketball", "_dataSource": "news", "_sport": "basketball", "_league": "nba" } },
    { "component": "Section", "props": { "title": "NBA", "collapsible": true, "defaultOpen": true, "accent": "red" },
      "children": [
        { "component": "ScoreCard", "props": { "sport": "NBA", "team1": "Lakers", "team1Abbr": "LAL", "score1": 112, "team2": "Celtics", "team2Abbr": "BOS", "score2": 108, "status": "Q3 4:22", "isLive": true, "_dataSource": "scoreboard", "_sport": "basketball", "_league": "nba" } },
        { "component": "CardRow", "props": { "columns": 2 }, "children": [
          { "component": "TeamCard", "props": { "team": "Los Angeles Lakers", "sport": "NBA", "record": "42-28", "ranking": 4, "nextGame": "vs Celtics — Apr 12" } },
          { "component": "Countdown", "props": { "event": "NBA Playoffs", "sport": "basketball", "daysUntil": 14, "context": "Western Conference" } }
        ]}
      ]
    },
    { "component": "StandingsSnapshot", "props": { "title": "NBA Western Conference", "sport": "nba", "teams": [{"name":"OKC","record":"57-14","gb":"—"},{"name":"HOU","record":"50-21","gb":"7"}], "_dataSource": "standings", "_sport": "basketball", "_league": "nba" } },
    { "component": "QuickLinks", "props": { "links": [{ "label": "NBA Scores", "category": "nba" }, { "label": "NFL Draft", "category": "nfl" }] } }
  ]
}

GENERATION RULES:
- Include 4–8 top-level items
- Use Sections to group related content by sport
- Use Tabs when a sport has both news and stats worth showing side by side
- Use CardRow for 2–3 compact summary widgets
- Vary structure across regenerations — avoid repeating the same layout
- Never place more than one ScoreCard for the same sport inside the same Section or Tabs tab
- Prioritize sports the user clicked, searched, or navigated to; deprioritize sports they ignored
- ${CONFIG.forceDatasourceAnnotations
    ? 'Always include _dataSource on ScoreCard, NewsHeadline, StandingsSnapshot, StatTable for NBA/NFL/MLB/NHL — this is required'
    : 'Use _dataSource annotations on ScoreCard and NewsHeadline whenever showing major US sports'}
- Prop values are illustrative — make them realistic with real team names and plausible numbers`
}

// Walk a layout tree and collect all _dataSource annotations
function collectDataSources(
  specs: ComponentSpec[]
): { path: number[]; dataSource: string; sportLeague: string; index: number }[] {
  const results: { path: number[]; dataSource: string; sportLeague: string; index: number }[] = []
  const counts: Record<string, number> = {}

  function walk(specs: ComponentSpec[], pathPrefix: number[]) {
    specs.forEach((spec, i) => {
      const path = [...pathPrefix, i]
      const ds = spec.props._dataSource as string | undefined
      const sport = spec.props._sport as string | undefined
      const league = spec.props._league as string | undefined

      if (ds && (sport || league)) {
        const sportLeague = league ?? sport ?? ''
        const key = `${ds}:${sportLeague}`
        const idx = counts[key] ?? 0
        counts[key] = idx + 1
        results.push({ path, dataSource: ds, sportLeague, index: idx })
      }

      if (spec.children) walk(spec.children, path)
      const tabs = spec.props.tabs as { children: ComponentSpec[] }[] | undefined
      if (tabs) tabs.forEach(tab => tab.children && walk(tab.children, path))
    })
  }

  walk(specs, [])
  return results
}

// Apply hydrated props at a given path
function applyHydration(
  specs: ComponentSpec[],
  path: number[],
  hydratedProps: Record<string, unknown>
): ComponentSpec[] {
  if (path.length === 0) return specs
  const [head, ...rest] = path
  return specs.map((spec, i) => {
    if (i !== head) return spec
    if (rest.length === 0) {
      // Remove _ prefixed keys and merge hydrated props
      const cleanProps = Object.fromEntries(
        Object.entries(spec.props).filter(([k]) => !k.startsWith('_'))
      )
      return { ...spec, props: { ...cleanProps, ...hydratedProps } }
    }
    // Recurse into children or tabs
    if (spec.children) {
      return { ...spec, children: applyHydration(spec.children, rest, hydratedProps) }
    }
    const tabs = spec.props.tabs as { children: ComponentSpec[] }[] | undefined
    if (tabs) {
      const newTabs = tabs.map(tab => ({
        ...tab,
        children: applyHydration(tab.children ?? [], rest, hydratedProps),
      }))
      return { ...spec, props: { ...spec.props, tabs: newTabs } }
    }
    return spec
  })
}

export async function hydrateLayout(
  layout: LayoutSpec,
  onUpdate: (updated: LayoutSpec) => void,
  query?: string
): Promise<LayoutSpec> {
  const sources = collectDataSources(layout.layout)
  if (sources.length === 0) return layout

  let current = layout

  // Fire hydration in parallel, update layout as each resolves
  await Promise.all(
    sources.map(async ({ path, dataSource, sportLeague, index }) => {
      const hydrated = await hydrateComponent(dataSource, sportLeague, index, query)
      if (!hydrated) return
      current = {
        layout: applyHydration(current.layout, path, hydrated),
      }
      onUpdate(current)
    })
  )

  return current
}

export async function generateLayout(
  apiKey: string,
  allEvents: BehaviorEvent[],
  query?: string,
  onStep?: (step: string) => void
): Promise<GenerateResult> {
  const recentEvents = allEvents.slice(0, RECENT_EVENT_LIMIT)
  const oldEvents = allEvents.slice(RECENT_EVENT_LIMIT)

  onStep?.('Compressing history + loading embedding model…')
  const onFirstLoad = () => onStep?.('Loading all-MiniLM-L6-v2 (first run only)…')
  const [preferencesSummary] = await Promise.all([
    oldEvents.length > 0 ? compressHistory(apiKey, oldEvents) : Promise.resolve(''),
    getComponentEmbeddings(onFirstLoad),
  ])

  onStep?.('Retrieving best components…')
  const hasQuery = !!query?.trim()
  const retrievalContext = hasQuery
    ? query!.trim()
    : [
        preferencesSummary,
        recentEvents.map(e => `${e.event}: ${e.item} [${e.sport}]`).join(' '),
      ].filter(Boolean).join('\n') || 'general sports news scores and highlights'

  const retrievedComponents = await retrieveTopComponents(retrievalContext, 10, onFirstLoad)
  const retrievedNames = retrievedComponents.map(r => r.name)

  onStep?.('Generating personalized layout…')

  const summarySection = preferencesSummary
    ? `PREFERENCE SUMMARY (background context — use to inform "For You" section only):\n${preferencesSummary}\n\n`
    : ''
  const recentSection = recentEvents.length > 0
    ? `RECENT EVENTS (background context — use to inform "For You" section only):\n${formatEvents(recentEvents)}\n\n`
    : 'No history yet — generate a compelling general sports homepage.\n\n'
  const querySection = hasQuery
    ? `SEARCH QUERY: "${query!.trim()}"
LAYOUT INSTRUCTIONS FOR SEARCH MODE:
- The top 2–3 items must directly answer this query — scores, standings, news, or previews for the searched topic
- After the query results, you may add a collapsible Section titled "For You" containing 1–2 history-based items
- Do NOT bury search results under personalized content\n\n`
    : ''

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    systemInstruction: buildSystemPrompt(retrievedNames),
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 1.5,
    },
  })

  const result = await model.generateContent(
    `${summarySection}${recentSection}${querySection}Generate a personalized ESPN homepage layout for this user.`
  )

  const layout = JSON.parse(result.response.text()) as LayoutSpec

  // Check if any components have data source annotations
  const hasSources = collectDataSources(layout.layout).length > 0

  return { layout, retrievedComponents, preferencesSummary, hydrating: hasSources }
}
