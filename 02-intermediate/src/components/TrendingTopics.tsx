interface TrendingTopic {
  label: string
  sport: string
  trend?: 'up' | 'hot'
}

interface TrendingTopicsProps {
  topics: TrendingTopic[]
}

export function TrendingTopics({ topics }: TrendingTopicsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-base">🔥</span>
        <h3 className="font-semibold text-gray-900">Trending</h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {topics.map((t, i) => (
          <li key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
              <span className="text-sm text-gray-900">{t.label}</span>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              t.trend === 'hot' ? 'bg-red-100 text-red-600' :
              t.trend === 'up'  ? 'bg-green-100 text-green-600' :
                                  'bg-gray-100 text-gray-500'
            }`}>
              {t.sport}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
