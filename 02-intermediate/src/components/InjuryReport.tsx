const STATUS_COLORS: Record<string, string> = {
  Out: 'bg-red-100 text-red-700',
  Questionable: 'bg-yellow-100 text-yellow-700',
  Probable: 'bg-green-100 text-green-700',
}

interface InjuredPlayer {
  name: string
  position: string
  status: 'Out' | 'Questionable' | 'Probable'
  note?: string
}

interface InjuryReportProps {
  team: string
  sport: string
  players: InjuredPlayer[]
}

export function InjuryReport({ team, sport, players }: InjuryReportProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">{team} Injury Report</h3>
        <p className="text-xs text-gray-400">{sport}</p>
      </div>
      <ul className="divide-y divide-gray-100">
        {players.map((p, i) => (
          <li key={i} className="px-4 py-2.5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-sm font-medium text-gray-900">{p.name}</span>
              <span className="text-xs text-gray-400 ml-1.5">{p.position}</span>
              {p.note && <p className="text-xs text-gray-400 mt-0.5">{p.note}</p>}
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
              {p.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
