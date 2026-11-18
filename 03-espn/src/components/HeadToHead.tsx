interface H2HStat {
  label: string
  value1: string
  value2: string
}

interface HeadToHeadProps {
  sport: string
  team1: string
  team2: string
  stats: H2HStat[]
}

function compareValues(v1: string, v2: string): -1 | 0 | 1 {
  const n1 = parseFloat(v1.replace(/[^0-9.-]/g, ''))
  const n2 = parseFloat(v2.replace(/[^0-9.-]/g, ''))
  if (isNaN(n1) || isNaN(n2)) return 0
  if (n1 > n2) return 1
  if (n1 < n2) return -1
  return 0
}

export function HeadToHead({ sport, team1, team2, stats }: HeadToHeadProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      {/* Header with both teams */}
      <div className="bg-[#1a1a1a] px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-black text-white uppercase">{team1}</span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{sport} · H2H</span>
        <span className="text-xs font-black text-white uppercase">{team2}</span>
      </div>
      {/* Stats rows */}
      <div className="divide-y divide-[#f0f0f0]">
        {stats.map((stat, i) => {
          const cmp = compareValues(stat.value1, stat.value2)
          return (
            <div key={i} className="flex items-center px-3 py-2">
              <span className={`flex-1 text-xs font-bold text-left tabular-nums ${cmp === 1 ? 'text-[#cc0000]' : 'text-[#1a1a1a]'}`}>
                {stat.value1}
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-bold px-3 flex-shrink-0">
                {stat.label}
              </span>
              <span className={`flex-1 text-xs font-bold text-right tabular-nums ${cmp === -1 ? 'text-[#cc0000]' : 'text-[#1a1a1a]'}`}>
                {stat.value2}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
