interface VideoHighlightProps {
  title: string
  sport: string
  duration: string
  description: string
}

export function VideoHighlight({ title, sport, duration, description }: VideoHighlightProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      {/* Thumbnail area */}
      <div className="relative bg-[#1a1a1a] aspect-video flex items-center justify-center">
        <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center">
          <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <span className="absolute top-2 left-2 text-[10px] font-bold bg-[#cc0000] text-white px-1.5 py-0.5 uppercase tracking-wider">
          {sport}
        </span>
        <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5">
          {duration}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <h3 className="text-sm font-bold text-[#1a1a1a] leading-tight">{title}</h3>
        <p className="text-[10px] text-gray-500 mt-1 leading-snug">{description}</p>
      </div>
    </div>
  )
}
