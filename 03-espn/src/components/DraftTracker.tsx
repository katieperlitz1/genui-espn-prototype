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
    <div className="bg-white border border-[#e5e5e5] flex overflow-hidden">
      <div className="bg-[#1a1a1a] w-14 flex-shrink-0 flex flex-col items-center justify-center py-3">
        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Pick</div>
        <div className="text-2xl font-black text-white leading-none">{pick}</div>
      </div>
      <div className="flex-1 px-3 py-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-black bg-[#cc0000] text-white px-1.5 py-0.5 uppercase">{sport}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{position}</span>
        </div>
        <div className="text-sm font-black text-[#1a1a1a]">{player}</div>
        <div className="text-xs text-gray-500 mt-0.5">{team}</div>
        {note && <div className="text-[10px] text-gray-400 italic mt-1">{note}</div>}
      </div>
    </div>
  )
}
