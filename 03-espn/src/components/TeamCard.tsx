interface TeamCardProps {
  team: string
  sport: string
  record: string
  ranking?: number
  nextGame?: string
  logoUrl?: string
}

export function TeamCard({ team, sport, record, ranking, nextGame, logoUrl }: TeamCardProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] p-3 flex items-center gap-3">
      {/* Logo / Placeholder */}
      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#f0f0f0] overflow-hidden">
        {logoUrl ? (
          <img src={logoUrl} alt={team} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-lg font-black text-gray-400">{team.slice(0, 1)}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {ranking && (
            <span className="text-[10px] font-black bg-[#cc0000] text-white px-1 py-0.5 leading-none">{ranking}</span>
          )}
          <span className="text-xs font-bold text-[#1a1a1a] truncate">{team}</span>
        </div>
        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">{sport}</div>
        <div className="text-sm font-black text-[#1a1a1a] mt-1">{record}</div>
        {nextGame && (
          <div className="text-[10px] text-gray-500 mt-1 truncate">{nextGame}</div>
        )}
      </div>
    </div>
  )
}
