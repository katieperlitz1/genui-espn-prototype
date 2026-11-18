interface Stat {
  label: string
  value: string
}

interface PlayerSpotlightProps {
  name: string
  team: string
  sport: string
  position: string
  stats: Stat[]
  note?: string
}

export function PlayerSpotlight({ name, team, sport, position, stats, note }: PlayerSpotlightProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="bg-[#1a1a1a] px-3 py-1.5">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Player Spotlight</span>
      </div>
      <div className="p-3 flex items-start gap-3">
        {/* Headshot placeholder */}
        <div className="w-14 h-14 rounded-full bg-[#f0f0f0] flex items-center justify-center flex-shrink-0 border-2 border-[#e5e5e5]">
          <span className="text-xl font-black text-gray-400">{name.charAt(0)}</span>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-black text-[#1a1a1a] text-sm leading-tight">{name}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">{position} · {team} · {sport}</div>
        </div>
      </div>
      {/* Stats grid */}
      {stats.length > 0 && (
        <div className={`border-t border-[#f0f0f0] grid divide-x divide-[#f0f0f0] ${stats.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {stats.slice(0, 3).map((stat, i) => (
            <div key={i} className="px-3 py-2.5 text-center">
              <div className="text-xl font-black text-[#1a1a1a] leading-none">{stat.value}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
      {note && (
        <div className="px-3 py-2 border-t border-[#f0f0f0] bg-[#f7f7f7]">
          <p className="text-[11px] text-gray-600 italic leading-snug">{note}</p>
        </div>
      )}
    </div>
  )
}
