import { GoogleGenerativeAI } from '@google/generative-ai'
import type { BehaviorEvent } from '../context/EventContext'
import { COMPONENT_CATALOG, CONTAINER_COMPONENTS } from './componentCatalog'
import { getComponentEmbeddings, retrieveTopComponents } from './embeddings'
import { compressHistory } from './memory'

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

  return `You are a personalized sports dashboard layout generator.

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

CONTAINER COMPONENTS (always available):

${containerSection}

LEAF COMPONENTS (semantically retrieved for this user):

${leafSection}

EXAMPLE of a well-structured nested layout:
{
  "layout": [
    { "component": "HeroSection", "props": { "title": "Cornell vs Maryland — NCAA Semifinal", "subtitle": "Live — Q3 12:04", "badge": "LIVE" } },
    { "component": "Section", "props": { "title": "Lacrosse", "collapsible": true, "defaultOpen": true, "accent": "blue" },
      "children": [
        { "component": "ScoreCard", "props": { "sport": "Lacrosse", "team1": "Cornell", "score1": 9, "team2": "Maryland", "score2": 7, "status": "Q3 12:04" } },
        { "component": "CardRow", "props": { "columns": 2 }, "children": [
          { "component": "TeamCard", "props": { "team": "Cornell", "sport": "Lacrosse", "record": "13-2", "ranking": 2, "nextGame": "NCAA Final — May 10" } },
          { "component": "Countdown", "props": { "event": "NCAA Championship", "sport": "lacrosse", "daysUntil": 7, "context": "Lincoln Financial Field, Philadelphia" } }
        ]}
      ]
    },
    { "component": "Tabs", "props": { "tabs": [
      { "label": "Golf News", "children": [
        { "component": "NewsHeadline", "props": { "headline": "McIlroy Takes Lead at Masters", "source": "ESPN Golf", "category": "Golf", "summary": "Rory McIlroy shot a 65 to take a two-stroke lead heading into Sunday." } }
      ]},
      { "label": "Leaderboard", "children": [
        { "component": "StatTable", "props": { "title": "Masters Leaderboard", "headers": ["Player", "Score", "Thru"], "rows": [["R. McIlroy", "-14", "F"],["J. Spieth", "-12", "F"]] } }
      ]}
    ]}},
    { "component": "QuickLinks", "props": { "links": [{ "label": "Lacrosse Scores", "category": "lacrosse" }, { "label": "Golf", "category": "golf" }] } }
  ]
}

GENERATION RULES:
- Include 4–8 top-level items
- Use Sections to group related content by sport
- Use Tabs when a sport has both news and stats worth showing side by side
- Use CardRow for 2–3 compact summary widgets
- Vary structure across generations — avoid repeating the same pattern
- Prioritize sports the user clicked and searched; deprioritize sports they scrolled past
- Prop values are illustrative — make them realistic and specific (real team names, plausible numbers)`
}

export async function generateLayout(
  apiKey: string,
  allEvents: BehaviorEvent[],
  query?: string,
  onStep?: (step: string) => void
): Promise<GenerateResult> {
  const recentEvents = allEvents.slice(0, RECENT_EVENT_LIMIT)
  const oldEvents = allEvents.slice(RECENT_EVENT_LIMIT)

  // Step 1: compress old history + pre-warm local embedding model in parallel
  onStep?.('Compressing history + loading embedding model…')
  const onFirstLoad = () => onStep?.('Loading all-MiniLM-L6-v2 (first run only)…')
  const [preferencesSummary] = await Promise.all([
    oldEvents.length > 0 ? compressHistory(apiKey, oldEvents) : Promise.resolve(''),
    getComponentEmbeddings(onFirstLoad),
  ])

  // Step 2: semantic retrieval — embed context, rank components
  // When a query is present, retrieve on query alone so results aren't diluted by history.
  // When browsing (no query), retrieve on history so the feed reflects long-term interests.
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

  // Step 3: generate layout
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
      temperature: 1.4,
    },
  })

  const result = await model.generateContent(
    `${summarySection}${recentSection}${querySection}Generate a personalized homepage layout for this user.`
  )

  const layout = JSON.parse(result.response.text()) as LayoutSpec
  return { layout, retrievedComponents, preferencesSummary }
}
