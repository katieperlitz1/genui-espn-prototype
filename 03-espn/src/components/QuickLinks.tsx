interface QuickLink {
  label: string
  category: string
}

interface QuickLinksProps {
  links: QuickLink[]
}

export function QuickLinks({ links }: QuickLinksProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="bg-[#1a1a1a] px-3 py-1.5">
        <span className="text-[10px] font-black text-white uppercase tracking-widest">Quick Links</span>
      </div>
      <div className="flex flex-wrap gap-0 p-0 divide-x divide-y divide-[#f0f0f0]">
        {links.map((link, i) => (
          <button
            key={i}
            className="px-4 py-2.5 text-xs font-bold text-[#cc0000] uppercase tracking-wide hover:bg-[#f7f7f7] transition-colors"
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )
}
