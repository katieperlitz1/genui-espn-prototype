interface GameResult {
  opponent: string
  result: 'W' | 'L'
  score: string
}

interface GameLogProps {
  team: string
  sport: string
  recentGames: GameResult[]
}

export function GameLog({ team, sport, recentGames }: GameLogProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">{team}</h3>
        <p className="text-xs text-gray-400">Recent Results · {sport}</p>
      </div>
      <ul className="divide-y divide-gray-100">
        {recentGames.map((g, i) => (
          <li key={i} className="px-4 py-2 flex items-center gap-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              g.result === 'W' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {g.result}
            </span>
            <span className="text-sm text-gray-700 flex-1">vs {g.opponent}</span>
            <span className="text-sm font-medium text-gray-900 font-mono">{g.score}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
