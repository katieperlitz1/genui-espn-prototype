interface ScoreCardProps {
  sport: string
  team1: string
  score1: number
  team2: string
  score2: number
  status: string
}

export function ScoreCard({ sport, team1, score1, team2, score2, status }: ScoreCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{sport}</div>
      <div className="flex items-center">
        <div className="flex-1 text-center">
          <div className="font-bold text-gray-900">{team1}</div>
          <div className="text-4xl font-black text-gray-900 mt-1">{score1}</div>
        </div>
        <div className="px-4 text-center">
          <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 whitespace-nowrap">{status}</span>
        </div>
        <div className="flex-1 text-center">
          <div className="font-bold text-gray-900">{team2}</div>
          <div className="text-4xl font-black text-gray-900 mt-1">{score2}</div>
        </div>
      </div>
    </div>
  )
}
