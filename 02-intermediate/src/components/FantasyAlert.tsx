const TYPE_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
  start:  { icon: '▲', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  sit:    { icon: '▼', color: 'text-red-600',   bg: 'bg-red-50 border-red-200' },
  pickup: { icon: '+', color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200' },
  drop:   { icon: '×', color: 'text-gray-500',  bg: 'bg-gray-50 border-gray-200' },
}

interface FantasyAlertProps {
  player: string
  sport: string
  type: string
  reason: string
}

export function FantasyAlert({ player, sport, type, reason }: FantasyAlertProps) {
  const s = TYPE_STYLES[type] ?? TYPE_STYLES.pickup
  return (
    <div className={`rounded-xl border p-4 ${s.bg}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-bold uppercase ${s.color}`}>
          {s.icon} Fantasy · {type.toUpperCase()}
        </span>
        <span className="text-xs text-gray-400">{sport}</span>
      </div>
      <div className="font-semibold text-gray-900 text-sm">{player}</div>
      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{reason}</p>
    </div>
  )
}
