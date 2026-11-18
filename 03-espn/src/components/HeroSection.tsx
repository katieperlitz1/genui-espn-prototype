const BADGE_STYLES: Record<string, string> = {
  LIVE:     'bg-[#cc0000] text-white',
  BREAKING: 'bg-[#e65c00] text-white',
  TRENDING: 'bg-[#0066cc] text-white',
}

interface HeroSectionProps {
  title: string
  subtitle: string
  badge?: string
  sport?: string
}

export function HeroSection({ title, subtitle, badge, sport }: HeroSectionProps) {
  return (
    <div className="bg-[#111111] border-t-4 border-[#cc0000] overflow-hidden">
      <div className="px-4 py-5">
        {(badge || sport) && (
          <div className="flex items-center gap-2 mb-3">
            {badge && (
              <div className="flex items-center gap-1.5">
                {badge === 'LIVE' && <span className="live-dot w-2 h-2 rounded-full bg-[#cc0000] inline-block" />}
                <span className={`text-[10px] font-black px-2 py-0.5 uppercase tracking-widest ${BADGE_STYLES[badge] ?? 'bg-gray-600 text-white'}`}>
                  {badge}
                </span>
              </div>
            )}
            {sport && (
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{sport}</span>
            )}
          </div>
        )}
        <h1 className="text-xl font-black text-white leading-tight">{title}</h1>
        <p className="text-gray-400 mt-2 text-sm leading-snug">{subtitle}</p>
      </div>
      {/* Red bottom stripe accent */}
      <div className="h-0.5 bg-gradient-to-r from-[#cc0000] to-transparent" />
    </div>
  )
}
