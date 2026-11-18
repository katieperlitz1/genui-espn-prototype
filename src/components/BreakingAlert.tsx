const SEVERITY_STYLES: Record<string, { bg: string; label: string }> = {
  breaking: { bg: 'bg-[#cc0000]', label: 'BREAKING' },
  injury:   { bg: 'bg-[#cc0000]', label: 'INJURY' },
  trade:    { bg: 'bg-[#e65c00]', label: 'TRADE' },
}

interface BreakingAlertProps {
  headline: string
  sport: string
  severity?: string
}

export function BreakingAlert({ headline, sport, severity = 'breaking' }: BreakingAlertProps) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.breaking
  return (
    <div className={`${style.bg} px-4 py-3 flex items-start gap-3`}>
      <span className="text-[10px] font-black bg-white text-[#cc0000] px-1.5 py-0.5 rounded-none shrink-0 uppercase tracking-widest mt-0.5">
        {style.label}
      </span>
      <div>
        <p className="text-sm font-bold text-white leading-snug">{headline}</p>
        <p className="text-[10px] text-red-200 uppercase tracking-widest mt-0.5 font-bold">{sport}</p>
      </div>
    </div>
  )
}
