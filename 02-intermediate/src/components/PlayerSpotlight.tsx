interface StatItem { label: string; value: string }

interface PlayerSpotlightProps {
  name: string
  team: string
  sport: string
  position: string
  stats: StatItem[]
  note?: string
}

export function PlayerSpotlight({ name, team, sport, position, stats, note }: PlayerSpotlightProps) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2)
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-black text-gray-500 flex-shrink-0">
          {initials}
        </div>
        <div>
          <div className="font-bold text-gray-900 leading-tight">{name}</div>
          <div className="text-xs text-gray-400">{position} · {team} · {sport}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {stats.slice(0, 3).map((s, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-lg font-black text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>
      {note && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{note}</p>}
    </div>
  )
}
