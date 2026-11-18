interface Topic {
  label: string
  sport: string
  trend?: 'up' | 'hot'
}

interface TrendingTopicsProps {
  topics: Topic[]
}

export function TrendingTopics({ topics }: TrendingTopicsProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="bg-[#1a1a1a] px-3 py-1.5 flex items-center gap-2">
        <span className="text-[10px] font-black text-white uppercase tracking-widest">Trending</span>
        <span className="text-[#cc0000] text-sm">🔥</span>
      </div>
      <div className="divide-y divide-[#f0f0f0]">
        {topics.map((topic, i) => (
          <div key={i} className="px-3 py-2.5 flex items-center gap-3">
            <span className="text-xs font-black text-gray-300 w-5 text-right shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#1a1a1a] truncate">{topic.label}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">{topic.sport}</div>
            </div>
            {topic.trend === 'hot' && (
              <span className="text-[10px] font-black text-[#cc0000] uppercase">HOT</span>
            )}
            {topic.trend === 'up' && (
              <span className="text-[10px] font-black text-green-600">▲</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
