interface NewsHeadlineProps {
  headline: string
  source: string
  category: string
  summary: string
}

export function NewsHeadline({ headline, source, category, summary }: NewsHeadlineProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{category}</span>
        <span className="text-xs text-gray-400">{source}</span>
      </div>
      <h3 className="font-semibold text-gray-900 leading-snug">{headline}</h3>
      <p className="text-sm text-gray-500 mt-1">{summary}</p>
    </div>
  )
}
