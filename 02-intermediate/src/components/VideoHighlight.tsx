interface VideoHighlightProps {
  title: string
  sport: string
  duration: string
  description: string
}

export function VideoHighlight({ title, sport, duration, description }: VideoHighlightProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-800 h-28 flex items-center justify-center relative">
        <div className="w-11 h-11 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white text-xl pl-1">
          ▶
        </div>
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {duration}
        </span>
        <span className="absolute top-2 left-2 text-xs font-semibold text-white bg-gray-700 bg-opacity-80 px-2 py-0.5 rounded">
          {sport}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  )
}
