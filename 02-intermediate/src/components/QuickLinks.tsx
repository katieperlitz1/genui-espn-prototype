interface QuickLinksProps {
  links: { label: string; category: string }[]
}

export function QuickLinks({ links }: QuickLinksProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link, i) => (
        <button
          key={i}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
        >
          {link.label}
        </button>
      ))}
    </div>
  )
}
