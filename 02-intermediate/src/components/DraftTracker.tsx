interface DraftTrackerProps {
  pick: number
  player: string
  position: string
  team: string
  sport: string
  note?: string
}

export function DraftTracker({ pick, player, position, team, sport, note }: DraftTrackerProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
      <div className="text-center flex-shrink-0 w-12">
        <div className="text-3xl font-black text-gray-100 leading-none">#{pick}</div>
        <div className="text-xs text-gray-400 mt-0.5">Pick</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 truncate">{player}</div>
        <div className="text-xs text-gray-400">{position} · {sport}</div>
        <div className="text-xs text-blue-600 font-medium mt-0.5">{team}</div>
        {note && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{note}</p>}
      </div>
    </div>
  )
}
