// Feature flags — set either to false to revert to original Prototype 3 behavior

export const CONFIG = {
  // Change 1: Gemini MUST add _dataSource annotations on ScoreCard, NewsHeadline,
  // StandingsSnapshot, StatTable for NBA/NFL/MLB/NHL instead of optionally doing so.
  // false → original "you MAY add" behavior (fewer real data hits, more Gemini-only data)
  forceDatasourceAnnotations: true,

  // Change 2: Filter ESPN API results toward the user's search query.
  // e.g. searching "Lakers" returns a Lakers game instead of any NBA game.
  // false → original behavior (first game/article/team in today's feed, unfiltered)
  queryDrivenHydration: true,
}
