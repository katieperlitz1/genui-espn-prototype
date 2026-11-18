interface CountdownProps {
  event: string
  sport: string
  daysUntil: number
  context?: string
}

export function Countdown({ event, sport, daysUntil, context }: CountdownProps) {
  const urgency = daysUntil <= 1 ? 'bg-red-50 border-red-200' : daysUntil <= 3 ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
  const textColor = daysUntil <= 1 ? 'text-red-700' : daysUntil <= 3 ? 'text-orange-700' : 'text-blue-700'
  const numColor = daysUntil <= 1 ? 'text-red-600' : daysUntil <= 3 ? 'text-orange-500' : 'text-blue-600'

  return (
    <div className={`rounded-xl border p-4 flex items-center gap-4 ${urgency}`}>
      <div className="text-center flex-shrink-0">
        <div className={`text-4xl font-black ${numColor}`}>{daysUntil}</div>
        <div className={`text-xs font-semibold uppercase tracking-wide ${textColor}`}>
          {daysUntil === 1 ? 'day' : 'days'}
        </div>
      </div>
      <div>
        <div className={`text-xs font-semibold uppercase tracking-wide ${textColor} mb-0.5`}>{sport}</div>
        <div className="font-bold text-gray-900">{event}</div>
        {context && <div className="text-xs text-gray-500 mt-0.5">{context}</div>}
      </div>
    </div>
  )
}
