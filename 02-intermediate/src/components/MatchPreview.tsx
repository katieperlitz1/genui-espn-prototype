interface MatchPreviewProps {
  sport: string
  team1: string
  team2: string
  dateTime: string
  venue?: string
  context?: string
}

export function MatchPreview({ sport, team1, team2, dateTime, venue, context }: MatchPreviewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{sport}</span>
        {context && (
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{context}</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="font-bold text-gray-900 text-lg">{team1}</div>
        </div>
        <div className="text-center px-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">vs</div>
          <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">{dateTime}</div>
        </div>
        <div className="text-center flex-1">
          <div className="font-bold text-gray-900 text-lg">{team2}</div>
        </div>
      </div>
      {venue && (
        <div className="text-xs text-gray-400 text-center mt-3">{venue}</div>
      )}
    </div>
  )
}
