interface TeamStanding {
  name: string
  record: string
  gb?: string
  streak?: string
}

interface StandingsSnapshotProps {
  title: string
  sport: string
  teams: TeamStanding[]
}

export function StandingsSnapshot({ title, sport, teams }: StandingsSnapshotProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <span className="text-xs text-gray-400">{sport}</span>
      </div>
      <ul className="divide-y divide-gray-100">
        {teams.map((t, i) => (
          <li key={i} className="px-4 py-2 flex items-center gap-2 text-sm">
            <span className="text-xs font-bold text-gray-300 w-5 flex-shrink-0">{i + 1}</span>
            <span className="font-medium text-gray-900 flex-1 truncate">{t.name}</span>
            <span className="text-gray-600 w-14 text-right">{t.record}</span>
            {t.gb !== undefined && (
              <span className="text-xs text-gray-400 w-12 text-right">{t.gb === '—' ? '—' : `${t.gb} GB`}</span>
            )}
            {t.streak && (
              <span className={`text-xs font-semibold w-10 text-right ${t.streak.startsWith('W') ? 'text-green-600' : 'text-red-500'}`}>
                {t.streak}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
