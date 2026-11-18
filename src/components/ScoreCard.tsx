interface ScoreCardProps {
  sport: string
  team1: string
  team1Abbr?: string
  score1: number
  team2: string
  team2Abbr?: string
  score2: number
  status: string
  isLive?: boolean
  team1Logo?: string
  team2Logo?: string
}

function TeamLogo({ url, abbr, color }: { url?: string; abbr?: string; color?: string }) {
  if (url) {
    return <img src={url} alt={abbr} className="w-10 h-10 object-contain" />
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black"
      style={{ backgroundColor: color ?? '#555' }}
    >
      {(abbr ?? '?').slice(0, 3)}
    </div>
  )
}

export function ScoreCard({ sport, team1, team1Abbr, score1, team2, team2Abbr, score2, status, isLive, team1Logo, team2Logo }: ScoreCardProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a1a1a] px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sport}</span>
        <div className="flex items-center gap-1.5">
          {isLive && <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#cc0000] inline-block" />}
          <span className={`text-[10px] font-bold uppercase tracking-wide ${isLive ? 'text-[#cc0000]' : 'text-gray-400'}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Score body */}
      <div className="flex items-center px-4 py-4">
        {/* Team 1 */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <TeamLogo url={team1Logo} abbr={team1Abbr ?? team1} />
          <div className="text-center">
            <div className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wide">{team1Abbr ?? team1}</div>
            <div className="text-[10px] text-gray-500 truncate max-w-[80px]">{team1}</div>
          </div>
          <div className="text-5xl font-black text-[#1a1a1a] leading-none">{score1}</div>
        </div>

        {/* Divider */}
        <div className="px-3">
          <div className="w-px h-16 bg-[#e5e5e5]" />
        </div>

        {/* Team 2 */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <TeamLogo url={team2Logo} abbr={team2Abbr ?? team2} />
          <div className="text-center">
            <div className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wide">{team2Abbr ?? team2}</div>
            <div className="text-[10px] text-gray-500 truncate max-w-[80px]">{team2}</div>
          </div>
          <div className="text-5xl font-black text-[#1a1a1a] leading-none">{score2}</div>
        </div>
      </div>
    </div>
  )
}
