interface Game {
  opponent: string
  result: 'W' | 'L'
  score: string
}

interface GameLogProps {
  team: string
  sport: string
  recentGames: Game[]
}

export function GameLog({ team, sport, recentGames }: GameLogProps) {
  const wins = recentGames.filter(g => g.result === 'W').length
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="bg-[#1a1a1a] px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Game Log</span>
        <span className="text-[10px] text-gray-400">{team} · {sport}</span>
      </div>
      {/* Win/loss dots summary */}
      <div className="px-3 py-2 flex items-center gap-1.5 border-b border-[#f0f0f0]">
        {recentGames.map((g, i) => (
          <span
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${g.result === 'W' ? 'bg-green-600' : 'bg-[#cc0000]'}`}
          >
            {g.result}
          </span>
        ))}
        <span className="ml-2 text-xs text-gray-500 font-medium">{wins}-{recentGames.length - wins} last {recentGames.length}</span>
      </div>
      <div className="divide-y divide-[#f0f0f0]">
        {recentGames.map((g, i) => (
          <div key={i} className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black w-5 text-center ${g.result === 'W' ? 'text-green-600' : 'text-[#cc0000]'}`}>
                {g.result}
              </span>
              <span className="text-xs text-gray-600">vs {g.opponent}</span>
            </div>
            <span className="text-xs font-bold text-[#1a1a1a] tabular-nums">{g.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
