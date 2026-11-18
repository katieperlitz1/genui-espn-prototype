interface CountdownProps {
  event: string
  sport: string
  daysUntil: number
  context?: string
}

export function Countdown({ event, sport, daysUntil, context }: CountdownProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="bg-[#cc0000] px-3 py-1.5">
        <span className="text-[10px] font-black text-white uppercase tracking-widest">{sport}</span>
      </div>
      <div className="px-4 py-4 text-center">
        <div className="text-6xl font-black text-[#1a1a1a] leading-none">{daysUntil}</div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Days Away</div>
        <div className="text-sm font-bold text-[#1a1a1a] mt-3 leading-tight">{event}</div>
        {context && <div className="text-[10px] text-gray-400 mt-1">{context}</div>}
      </div>
    </div>
  )
}
