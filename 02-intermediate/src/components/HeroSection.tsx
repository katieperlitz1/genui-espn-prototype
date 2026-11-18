const BADGE_COLORS: Record<string, string> = {
  LIVE: 'bg-red-500 text-white',
  BREAKING: 'bg-orange-500 text-white',
  TRENDING: 'bg-blue-500 text-white',
}

interface HeroSectionProps {
  title: string
  subtitle: string
  badge?: string
}

export function HeroSection({ title, subtitle, badge }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl p-6 text-white">
      {badge && (
        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mb-3 ${BADGE_COLORS[badge] ?? 'bg-gray-500 text-white'}`}>
          {badge}
        </span>
      )}
      <h1 className="text-2xl font-bold leading-tight">{title}</h1>
      <p className="text-gray-300 mt-2 text-sm">{subtitle}</p>
    </div>
  )
}
