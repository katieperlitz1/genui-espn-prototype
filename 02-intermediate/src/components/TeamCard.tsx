interface TeamCardProps {
  team: string
  sport: string
  record: string
  ranking?: number
  nextGame?: string
}

export function TeamCard({ team, sport, record, ranking, nextGame }: TeamCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-black text-gray-400 flex-shrink-0">
        {team.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 truncate">{team}</h3>
          {ranking && (
            <span className="text-xs font-semibold text-white bg-gray-700 rounded px-1.5 py-0.5 flex-shrink-0">
              #{ranking}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{sport} · {record}</div>
        {nextGame && <div className="text-xs text-blue-600 mt-1">{nextGame}</div>}
      </div>
    </div>
  )
}
