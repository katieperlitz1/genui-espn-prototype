import { useState, type ReactNode } from 'react'
import { useEvents } from '../../context/EventContext'

const ACCENT_COLORS: Record<string, string> = {
  blue:   'border-l-blue-500',
  green:  'border-l-green-500',
  red:    'border-l-red-500',
  purple: 'border-l-purple-500',
  orange: 'border-l-orange-500',
  gray:   'border-l-gray-400',
}

interface SectionProps {
  title: string
  collapsible?: boolean
  defaultOpen?: boolean
  accent?: string
  children: ReactNode
}

export function Section({ title, collapsible = true, defaultOpen = true, accent = 'blue', children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const { logEvent } = useEvents()
  const accentClass = ACCENT_COLORS[accent] ?? ACCENT_COLORS.blue

  function handleToggle() {
    if (!collapsible) return
    const next = !open
    setOpen(next)
    if (next) {
      logEvent({ event: 'EXPANDED', item: title, sport: accent ?? 'general', timestamp: new Date().toISOString() })
    }
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm border-l-4 ${accentClass} overflow-hidden`}>
      <div
        className={`px-4 py-3 flex items-center justify-between border-b border-gray-100 ${collapsible ? 'cursor-pointer select-none hover:bg-gray-50' : ''}`}
        onClick={handleToggle}
      >
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {collapsible && (
          <span className={`text-gray-400 text-sm transition-transform duration-200 ${open ? '' : '-rotate-90'}`}>
            ▾
          </span>
        )}
      </div>
      {open && (
        <div className="p-3 flex flex-col gap-3">
          {children}
        </div>
      )}
    </div>
  )
}
