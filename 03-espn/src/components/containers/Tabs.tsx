import { useState, type ReactNode } from 'react'
import { useEvents } from '../../context/EventContext'

export interface TabItem {
  label: string
  content: ReactNode[]
}

interface TabsComponentProps {
  tabs: TabItem[]
}

export function TabsComponent({ tabs }: TabsComponentProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const { logEvent } = useEvents()

  if (tabs.length === 0) return null

  function handleTabChange(i: number) {
    setActiveIndex(i)
    logEvent({
      event: 'CLICKED',
      item: `tab: ${tabs[i].label}`,
      sport: 'general',
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="flex border-b-2 border-[#e5e5e5] bg-[#f7f7f7]">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => handleTabChange(i)}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-colors border-b-2 -mb-[2px] ${
              i === activeIndex
                ? 'text-[#cc0000] border-[#cc0000] bg-white'
                : 'text-gray-500 border-transparent hover:text-[#1a1a1a] hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-3 flex flex-col gap-3">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  )
}
