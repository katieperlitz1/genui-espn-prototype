// ESPN public API — proxied through Vite dev server at /espn to avoid CORS
// Proxy: /espn/{sport}/{league}/{endpoint} → site.api.espn.com/apis/site/v2/sports/...
import { CONFIG } from './config'

export interface ESPNGame {
  id: string
  team1: string
  team1Abbr: string
  score1: number
  team2: string
  team2Abbr: string
  score2: number
  status: string
  isLive: boolean
  team1Logo?: string
  team2Logo?: string
  team1Color?: string
  team2Color?: string
}

export interface ESPNArticle {
  headline: string
  summary: string
  source: string
  category: string
  imageUrl?: string
}

export interface ESPNStandingTeam {
  name: string
  abbr: string
  record: string
  gb?: string
  streak?: string
}

// Maps common sport names → ESPN sport/league path segments
const LEAGUE_MAP: Record<string, [string, string]> = {
  nba:      ['basketball', 'nba'],
  nfl:      ['football', 'nfl'],
  mlb:      ['baseball', 'mlb'],
  nhl:      ['hockey', 'nhl'],
  wnba:     ['basketball', 'wnba'],
  ncaaf:    ['football', 'college-football'],
  ncaab:    ['basketball', 'mens-college-basketball'],
  mls:      ['soccer', 'usa.1'],
  soccer:   ['soccer', 'usa.1'],
  golf:     ['golf', 'leaderboard'],
  basketball: ['basketball', 'nba'],
  football:   ['football', 'nfl'],
  baseball:   ['baseball', 'mlb'],
  hockey:     ['hockey', 'nhl'],
}

function resolveLeague(sportOrLeague: string): [string, string] | null {
  const key = sportOrLeague.toLowerCase().trim()
  if (key.includes('/')) {
    const [s, l] = key.split('/')
    return [s, l]
  }
  return LEAGUE_MAP[key] ?? null
}

async function espnFetch(sport: string, league: string, endpoint: string): Promise<unknown> {
  const url = `/espn/${sport}/${league}/${endpoint}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`ESPN ${res.status}: ${sport}/${league}/${endpoint}`)
  return res.json()
}

export async function fetchScoreboard(sportOrLeague: string, limit = 4): Promise<ESPNGame[]> {
  const resolved = resolveLeague(sportOrLeague)
  if (!resolved) return []
  const [sport, league] = resolved

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await espnFetch(sport, league, 'scoreboard') as any
    const events: unknown[] = data.events ?? []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (events as any[]).slice(0, limit).map((event: any) => {
      const comp = event.competitions?.[0]
      if (!comp) return null
      const [c1, c2] = comp.competitors ?? []
      if (!c1 || !c2) return null
      const statusDetail = comp.status?.type?.shortDetail ?? comp.status?.type?.detail ?? '—'
      const isLive = comp.status?.type?.state === 'in'
      return {
        id: event.id,
        team1: c1.team?.shortDisplayName ?? c1.team?.displayName ?? 'TBD',
        team1Abbr: c1.team?.abbreviation ?? '',
        score1: parseInt(c1.score ?? '0') || 0,
        team2: c2.team?.shortDisplayName ?? c2.team?.displayName ?? 'TBD',
        team2Abbr: c2.team?.abbreviation ?? '',
        score2: parseInt(c2.score ?? '0') || 0,
        status: statusDetail,
        isLive,
        team1Logo: c1.team?.logo,
        team2Logo: c2.team?.logo,
        team1Color: c1.team?.color ? `#${c1.team.color}` : undefined,
        team2Color: c2.team?.color ? `#${c2.team.color}` : undefined,
      } as ESPNGame
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).filter(Boolean) as ESPNGame[]
  } catch (e) {
    console.warn('[ESPN] scoreboard fetch failed:', e)
    return []
  }
}

export async function fetchNews(sportOrLeague: string, limit = 5): Promise<ESPNArticle[]> {
  const resolved = resolveLeague(sportOrLeague)
  if (!resolved) return []
  const [sport, league] = resolved

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await espnFetch(sport, league, 'news') as any
    const articles: unknown[] = data.articles ?? []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (articles as any[]).slice(0, limit).map((a: any) => ({
      headline: a.headline ?? '',
      summary: a.description ?? a.story?.slice(0, 140) ?? '',
      source: a.byLine ? `By ${a.byLine}` : 'ESPN',
      category: (a.categories?.find((c: { type: string; description?: string }) => c.type === 'league')?.description
        ?? league.toUpperCase()),
      imageUrl: a.images?.[0]?.url,
    }))
  } catch (e) {
    console.warn('[ESPN] news fetch failed:', e)
    return []
  }
}

export async function fetchStandings(sportOrLeague: string): Promise<ESPNStandingTeam[]> {
  const resolved = resolveLeague(sportOrLeague)
  if (!resolved) return []
  const [sport, league] = resolved

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await espnFetch(sport, league, 'standings') as any
    const teams: ESPNStandingTeam[] = []

    // ESPN standings are nested: children[].standings.entries[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function extractEntries(node: any) {
      if (node?.standings?.entries) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const entry of node.standings.entries as any[]) {
          const team = entry.team
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const stats: any[] = entry.stats ?? []
          const wins = stats.find((s) => s.name === 'wins')?.value ?? 0
          const losses = stats.find((s) => s.name === 'losses')?.value ?? 0
          const gb = stats.find((s) => s.name === 'gamesBehind')?.value
          const streak = stats.find((s) => s.name === 'streak')
          teams.push({
            name: team?.shortDisplayName ?? team?.displayName ?? '—',
            abbr: team?.abbreviation ?? '',
            record: `${wins}-${losses}`,
            gb: gb !== undefined && gb !== 0 ? String(gb) : '—',
            streak: streak?.displayValue as string | undefined,
          })
        }
      }
      if (node?.children) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const child of node.children as any[]) extractEntries(child)
      }
    }

    extractEntries(data)
    return teams.slice(0, 8)
  } catch (e) {
    console.warn('[ESPN] standings fetch failed:', e)
    return []
  }
}

// Hydration: given a _dataSource/_sport/_league annotation, fetch + return
// the first matching item's props to merge into a component.
// When CONFIG.queryDrivenHydration is true and a query is provided, results are
// filtered to prefer items semantically matching the query (team name, keyword).
export async function hydrateComponent(
  dataSource: string,
  sportOrLeague: string,
  index: number,
  query?: string
): Promise<Record<string, unknown> | null> {
  // Normalised query terms for matching — only used when queryDrivenHydration is on
  const terms = (CONFIG.queryDrivenHydration && query)
    ? query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
    : []

  function matchesQuery(text: string): boolean {
    if (terms.length === 0) return false
    const t = text.toLowerCase()
    return terms.some(term => t.includes(term))
  }

  if (dataSource === 'scoreboard') {
    const games = await fetchScoreboard(sportOrLeague)
    if (games.length === 0) return null

    // Prefer a game where a team name / abbreviation matches query terms
    const preferred = terms.length > 0
      ? games.find(g =>
          matchesQuery(g.team1) || matchesQuery(g.team2) ||
          matchesQuery(g.team1Abbr) || matchesQuery(g.team2Abbr)
        )
      : undefined

    // Don't fall back to games[0] when index is out of range — that would
    // show the same game twice when Gemini generates multiple ScoreCards
    // but the API only has one game today.
    const g = preferred ?? (index < games.length ? games[index] : null)
    if (!g) return null
    return {
      team1: g.team1, team1Abbr: g.team1Abbr, score1: g.score1,
      team2: g.team2, team2Abbr: g.team2Abbr, score2: g.score2,
      status: g.status, isLive: g.isLive,
      team1Logo: g.team1Logo, team2Logo: g.team2Logo,
    }
  }

  if (dataSource === 'news') {
    const articles = await fetchNews(sportOrLeague)
    if (articles.length === 0) return null

    // Prefer an article whose headline or summary matches query terms
    const preferred = terms.length > 0
      ? articles.find(a => matchesQuery(a.headline) || matchesQuery(a.summary))
      : undefined

    const a = preferred ?? articles[index] ?? articles[0]
    return {
      headline: a.headline, summary: a.summary,
      source: a.source, category: a.category,
      imageUrl: a.imageUrl,
    }
  }

  if (dataSource === 'standings') {
    const teams = await fetchStandings(sportOrLeague)
    if (teams.length === 0) return null
    return {
      teams: teams.map(t => ({ name: t.name, record: t.record, gb: t.gb, streak: t.streak })),
    }
  }

  return null
}
