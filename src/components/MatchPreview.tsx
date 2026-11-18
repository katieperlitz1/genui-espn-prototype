interface MatchPreviewProps {
  sport: string
  team1: string
  team2: string
  dateTime: string
  venue?: string
  context?: string
}

export function MatchPreview({ sport, team1, team2, dateTime, venue, context }: MatchPreviewProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="bg-[#1a1a1a] px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sport}</span>
        {context && <span className="text-[10px] text-gray-500">{context}</span>}
      </div>
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="flex-1 text-right">
          <div className="text-sm font-black text-[#1a1a1a] uppercase">{team1}</div>
        </div>
        <div className="flex-shrink-0 text-center px-2">
          <div className="text-xs font-black text-gray-400 uppercase tracking-widest">vs</div>
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-black text-[#1a1a1a] uppercase">{team2}</div>
        </div>
      </div>
      <div className="border-t border-[#f0f0f0] px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-bold text-[#cc0000]">{dateTime}</span>
        {venue && <span className="text-[10px] text-gray-400">{venue}</span>}
      </div>
    </div>
  )
}
