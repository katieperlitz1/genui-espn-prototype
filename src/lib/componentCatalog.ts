export interface ComponentEntry {
  name: string
  description: string
  schema: string
  type: 'leaf' | 'container'
}

export const COMPONENT_CATALOG: ComponentEntry[] = [
  // ── Containers ──────────────────────────────────────────────────────────
  {
    name: 'Section',
    type: 'container',
    description: 'Collapsible grouped section under a sport or category heading. Organizes related cards hierarchically.',
    schema: '{ title: string, collapsible?: boolean, defaultOpen?: boolean, accent?: "red"|"blue"|"green"|"purple"|"orange"|"gray" }',
  },
  {
    name: 'Tabs',
    type: 'container',
    description: 'Tabbed interface showing multiple views of related content — scores, news, stats — for the same topic.',
    schema: '{ tabs: [{ label: string, children: ComponentSpec[] }] }',
  },
  {
    name: 'CardRow',
    type: 'container',
    description: 'Horizontal row showing 2–3 compact cards side by side for quick summary comparisons.',
    schema: '{ columns?: 2 | 3 }',
  },

  // ── Leaf components (19, retrieved via embedding similarity) ─────────────
  {
    name: 'HeroSection',
    type: 'leaf',
    description: 'Large featured story at top of page — breaking news, live game, or major ongoing event. High visual impact.',
    schema: '{ title: string, subtitle: string, badge?: "LIVE"|"BREAKING"|"TRENDING", sport?: string, _dataSource?: "scoreboard"|"news", _sport?: string, _league?: string }',
  },
  {
    name: 'ScoreCard',
    type: 'leaf',
    description: 'Live or final game score for two teams with current game status. Best for active or recently completed games.',
    schema: '{ sport: string, team1: string, team1Abbr?: string, score1: number, team2: string, team2Abbr?: string, score2: number, status: string, isLive?: boolean, team1Logo?: string, team2Logo?: string, _dataSource?: "scoreboard", _sport?: string, _league?: string }',
  },
  {
    name: 'MatchPreview',
    type: 'leaf',
    description: 'Upcoming scheduled game preview with date, time, and venue. Use for future games, not live or finished ones.',
    schema: '{ sport: string, team1: string, team2: string, dateTime: string, venue?: string, context?: string }',
  },
  {
    name: 'NewsHeadline',
    type: 'leaf',
    description: 'Sports news article with headline and brief summary. Trades, injuries, analysis, general sports journalism.',
    schema: '{ headline: string, source: string, category: string, summary: string, imageUrl?: string, _dataSource?: "news", _sport?: string, _league?: string }',
  },
  {
    name: 'StatTable',
    type: 'leaf',
    description: 'Rankings, leaderboards, or statistics table. Season stats, scoring leaders, power rankings.',
    schema: '{ title: string, headers: string[], rows: string[][], _dataSource?: "standings", _sport?: string, _league?: string }',
  },
  {
    name: 'TeamCard',
    type: 'leaf',
    description: "A team's current record, national ranking, and next scheduled game. Use when user follows a specific team closely.",
    schema: '{ team: string, sport: string, record: string, ranking?: number, nextGame?: string, logoUrl?: string }',
  },
  {
    name: 'Countdown',
    type: 'leaf',
    description: 'Days until a major upcoming event: playoffs, championship, draft, season opener. Creates urgency for time-sensitive content.',
    schema: '{ event: string, sport: string, daysUntil: number, context?: string }',
  },
  {
    name: 'TrendingTopics',
    type: 'leaf',
    description: 'Ranked list of trending searches and hot sports topics. Good for casual browsing or when no single sport dominates.',
    schema: '{ topics: [{ label: string, sport: string, trend?: "up"|"hot" }] }',
  },
  {
    name: 'QuickLinks',
    type: 'leaf',
    description: 'Navigation shortcuts to sport categories or pages. Personalized quick access based on most-visited areas.',
    schema: '{ links: [{ label: string, category: string }] }',
  },
  {
    name: 'BettingOdds',
    type: 'leaf',
    description: 'Moneyline and spread betting odds for a game. Use when user has searched for odds, betting lines, or gambling-related content.',
    schema: '{ game: string, sport: string, team1: string, line1: string, team2: string, line2: string, total?: string }',
  },
  {
    name: 'PlayerSpotlight',
    type: 'leaf',
    description: 'Featured player card with key statistics and a note. Use when user follows a specific player or searches for player performance.',
    schema: '{ name: string, team: string, sport: string, position: string, stats: [{ label: string, value: string }], note?: string }',
  },
  {
    name: 'InjuryReport',
    type: 'leaf',
    description: 'Injury status list for a team. Use when user cares about team availability, fantasy sports, or follows a specific team.',
    schema: '{ team: string, sport: string, players: [{ name: string, position: string, status: "Out"|"Questionable"|"Probable", note?: string }] }',
  },
  {
    name: 'StandingsSnapshot',
    type: 'leaf',
    description: 'Condensed league or conference standings with win-loss records. Use for standings-focused or division-race queries.',
    schema: '{ title: string, sport: string, teams: [{ name: string, record: string, gb?: string, streak?: string }], _dataSource?: "standings", _sport?: string, _league?: string }',
  },
  {
    name: 'VideoHighlight',
    type: 'leaf',
    description: 'Featured video highlight or recap card — top plays, game highlights, post-game interviews.',
    schema: '{ title: string, sport: string, duration: string, description: string }',
  },
  {
    name: 'BreakingAlert',
    type: 'leaf',
    description: 'Prominent full-width banner for urgent sports news: major trades, sudden injuries, coaching changes.',
    schema: '{ headline: string, sport: string, severity?: "trade"|"injury"|"breaking" }',
  },
  {
    name: 'GameLog',
    type: 'leaf',
    description: "A team's last 3–5 game results showing win/loss streak. Use when user tracks a specific team's recent form.",
    schema: '{ team: string, sport: string, recentGames: [{ opponent: string, result: "W"|"L", score: string }] }',
  },
  {
    name: 'HeadToHead',
    type: 'leaf',
    description: 'Side-by-side statistical comparison of two teams. Use for rivalry games, matchup previews, comparative analysis.',
    schema: '{ sport: string, team1: string, team2: string, stats: [{ label: string, value1: string, value2: string }] }',
  },
  {
    name: 'DraftTracker',
    type: 'leaf',
    description: 'Draft pick or prospect card. Use when user is interested in the NFL Draft, NBA Draft, or college recruiting.',
    schema: '{ pick: number, player: string, position: string, team: string, sport: string, note?: string }',
  },
  {
    name: 'FantasyAlert',
    type: 'leaf',
    description: 'Fantasy sports recommendation card — start/sit advice, waiver wire pickup, injury impact on fantasy value.',
    schema: '{ player: string, sport: string, type: "start"|"sit"|"pickup"|"drop", reason: string }',
  },
]

export const LEAF_COMPONENTS = COMPONENT_CATALOG.filter(c => c.type === 'leaf')
export const CONTAINER_COMPONENTS = COMPONENT_CATALOG.filter(c => c.type === 'container')
