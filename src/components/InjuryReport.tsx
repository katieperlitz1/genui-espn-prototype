const STATUS_STYLES: Record<string, string> = {
  Out:          'bg-[#cc0000] text-white',
  Questionable: 'bg-[#f59e0b] text-white',
  Probable:     'bg-[#16a34a] text-white',
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
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="bg-[#1a1a1a] px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Injury Report</span>
        <span className="text-[10px] text-[#cc0000] font-bold uppercase">{team} · {sport}</span>
      </div>
      <div className="divide-y divide-[#f0f0f0]">
        {players.map((p, i) => (
          <div key={i} className="px-3 py-2 flex items-center gap-3">
            <span className={`text-[10px] font-black px-1.5 py-0.5 uppercase tracking-wide shrink-0 ${STATUS_STYLES[p.status] ?? 'bg-gray-400 text-white'}`}>
              {p.status}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-[#1a1a1a]">{p.name}</span>
              <span className="text-[10px] text-gray-400 ml-1.5 uppercase">{p.position}</span>
              {p.note && <div className="text-[10px] text-gray-500 mt-0.5 truncate">{p.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
