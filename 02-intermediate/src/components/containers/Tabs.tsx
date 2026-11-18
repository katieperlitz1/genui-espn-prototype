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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => handleTabChange(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors flex-1 ${
              i === activeIndex
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
