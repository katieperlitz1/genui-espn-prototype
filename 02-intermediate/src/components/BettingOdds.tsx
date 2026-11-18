interface BettingOddsProps {
  game: string
  sport: string
  team1: string
  line1: string
  team2: string
  line2: string
  total?: string
}

export function BettingOdds({ game, sport, team1, line1, team2, line2, total }: BettingOddsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{sport} · Odds</span>
        {total && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">O/U {total}</span>}
      </div>
      <p className="text-xs text-gray-500 mb-3 truncate">{game}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1 truncate">{team1}</div>
          <div className="font-bold text-gray-900 text-lg">{line1}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1 truncate">{team2}</div>
          <div className="font-bold text-gray-900 text-lg">{line2}</div>
        </div>
      </div>
    </div>
  )
}
