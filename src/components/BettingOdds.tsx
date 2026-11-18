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
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="bg-[#1a1a1a] px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Odds · {sport}</span>
        <span className="text-[10px] text-gray-500 truncate max-w-[140px]">{game}</span>
      </div>
      <div className="flex items-stretch divide-x divide-[#f0f0f0]">
        <div className="flex-1 px-3 py-3 text-center">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-1">{team1}</div>
          <div className="text-2xl font-black text-[#1a1a1a]">{line1}</div>
        </div>
        {total && (
          <div className="px-3 py-3 text-center flex-shrink-0">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-1">O/U</div>
            <div className="text-2xl font-black text-[#1a1a1a]">{total}</div>
          </div>
        )}
        <div className="flex-1 px-3 py-3 text-center">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-1">{team2}</div>
          <div className="text-2xl font-black text-[#1a1a1a]">{line2}</div>
        </div>
      </div>
      <div className="px-3 py-1.5 bg-[#f7f7f7] border-t border-[#f0f0f0]">
        <p className="text-[9px] text-gray-400">Must be 21+ to bet. Gambling problem? Call 1-800-GAMBLER.</p>
      </div>
    </div>
  )
}
