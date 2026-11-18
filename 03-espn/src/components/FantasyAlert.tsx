const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  start:  { bg: 'bg-green-600',  text: 'text-white', label: 'START' },
  sit:    { bg: 'bg-[#cc0000]',  text: 'text-white', label: 'SIT' },
  pickup: { bg: 'bg-[#0066cc]',  text: 'text-white', label: 'PICKUP' },
  drop:   { bg: 'bg-gray-500',   text: 'text-white', label: 'DROP' },
}

interface FantasyAlertProps {
  player: string
  sport: string
  type: 'start' | 'sit' | 'pickup' | 'drop'
  reason: string
}

export function FantasyAlert({ player, sport, type, reason }: FantasyAlertProps) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.start
  return (
    <div className="bg-white border border-[#e5e5e5] flex overflow-hidden">
      <div className={`${style.bg} w-16 flex-shrink-0 flex items-center justify-center`}>
        <span className={`text-[11px] font-black ${style.text} uppercase tracking-widest writing-vertical`}
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          {style.label}
        </span>
      </div>
      <div className="flex-1 px-3 py-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fantasy · {sport}</span>
        </div>
        <div className="text-sm font-black text-[#1a1a1a]">{player}</div>
        <p className="text-xs text-gray-500 mt-1 leading-snug">{reason}</p>
      </div>
    </div>
  )
}
