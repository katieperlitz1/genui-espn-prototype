interface H2HStat { label: string; value1: string; value2: string }

interface HeadToHeadProps {
  sport: string
  team1: string
  team2: string
  stats: H2HStat[]
}

export function HeadToHead({ sport, team1, team2, stats }: HeadToHeadProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 grid grid-cols-3 text-sm">
        <span className="font-bold text-gray-900 truncate">{team1}</span>
        <span className="text-center text-xs text-gray-400 self-center">{sport}</span>
        <span className="font-bold text-gray-900 text-right truncate">{team2}</span>
      </div>
      <div className="divide-y divide-gray-100">
        {stats.map((s, i) => (
          <div key={i} className="px-4 py-2 grid grid-cols-3 items-center text-sm">
            <span className="font-semibold text-gray-900">{s.value1}</span>
            <span className="text-center text-xs text-gray-400">{s.label}</span>
            <span className="font-semibold text-gray-900 text-right">{s.value2}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
