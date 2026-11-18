const SEVERITY: Record<string, { bg: string; badge: string; label: string }> = {
  trade:    { bg: 'bg-purple-50 border-purple-200', badge: 'bg-purple-500', label: 'TRADE' },
  injury:   { bg: 'bg-red-50 border-red-200',       badge: 'bg-red-500',    label: 'INJURY' },
  breaking: { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-500', label: 'BREAKING' },
}

interface BreakingAlertProps {
  headline: string
  sport: string
  severity?: string
}

export function BreakingAlert({ headline, sport, severity = 'breaking' }: BreakingAlertProps) {
  const s = SEVERITY[severity] ?? SEVERITY.breaking
  return (
    <div className={`rounded-xl border-2 p-4 flex items-center gap-3 ${s.bg}`}>
      <span className={`text-xs font-bold text-white px-2 py-1 rounded flex-shrink-0 ${s.badge}`}>
        {s.label}
      </span>
      <div>
        <p className="font-semibold text-gray-900 text-sm leading-snug">{headline}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sport}</p>
      </div>
    </div>
  )
}
