interface StandingTeam {
  name: string
  record: string
  gb?: string
  streak?: string
}

interface StandingsSnapshotProps {
  title: string
  sport: string
  teams: StandingTeam[]
}

export function StandingsSnapshot({ title, teams }: StandingsSnapshotProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="bg-[#1a1a1a] px-3 py-2 flex items-center justify-between">
        <h3 className="text-xs font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#f0f0f0] border-b border-[#e5e5e5]">
            <th className="px-3 py-1.5 text-[10px] font-black text-gray-500 uppercase tracking-wider text-left">Team</th>
            <th className="px-3 py-1.5 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">W-L</th>
            <th className="px-3 py-1.5 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">GB</th>
            {teams.some(t => t.streak) && (
              <th className="px-3 py-1.5 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">STK</th>
            )}
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <tr key={i} className={`border-b border-[#f0f0f0] ${i % 2 === 0 ? 'bg-white' : 'bg-[#f7f7f7]'}`}>
              <td className="px-3 py-2 font-bold text-[#1a1a1a]">{team.name}</td>
              <td className="px-3 py-2 text-right text-gray-600 tabular-nums">{team.record}</td>
              <td className="px-3 py-2 text-right text-gray-400 tabular-nums">{team.gb ?? '—'}</td>
              {teams.some(t => t.streak) && (
                <td className="px-3 py-2 text-right font-medium tabular-nums">
                  <span className={team.streak?.startsWith('W') ? 'text-green-600' : 'text-red-500'}>
                    {team.streak ?? '—'}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
