interface NewsHeadlineProps {
  headline: string
  source: string
  category: string
  summary: string
  imageUrl?: string
}

export function NewsHeadline({ headline, source, category, summary, imageUrl }: NewsHeadlineProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] flex overflow-hidden">
      {/* Content */}
      <div className="flex-1 p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black bg-[#cc0000] text-white px-1.5 py-0.5 uppercase tracking-wider">
            {category}
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{source}</span>
        </div>
        <h3 className="text-sm font-bold text-[#1a1a1a] leading-tight line-clamp-3">{headline}</h3>
        {summary && (
          <p className="text-xs text-gray-500 leading-snug line-clamp-2">{summary}</p>
        )}
      </div>

      {/* Thumbnail */}
      {imageUrl && (
        <div className="w-20 flex-shrink-0 bg-gray-100 overflow-hidden">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
      {!imageUrl && (
        <div className="w-20 flex-shrink-0 bg-[#f0f0f0] flex items-center justify-center text-gray-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
        </div>
      )}
    </div>
  )
}
