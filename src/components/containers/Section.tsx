import { useState, type ReactNode } from 'react'
import { useEvents } from '../../context/EventContext'

const ACCENT_BORDERS: Record<string, string> = {
  red:    'border-l-[#cc0000]',
  blue:   'border-l-[#0066cc]',
  green:  'border-l-[#16a34a]',
  purple: 'border-l-purple-600',
  orange: 'border-l-[#e65c00]',
  gray:   'border-l-gray-400',
}

interface SectionProps {
  title: string
  collapsible?: boolean
  defaultOpen?: boolean
  accent?: string
  children: ReactNode
}

export function Section({ title, collapsible = true, defaultOpen = true, accent = 'red', children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const { logEvent } = useEvents()
  const accentClass = ACCENT_BORDERS[accent] ?? ACCENT_BORDERS.red

  function handleToggle() {
    if (!collapsible) return
    const next = !open
    setOpen(next)
    if (next) {
      logEvent({ event: 'EXPANDED', item: title, sport: accent ?? 'general', timestamp: new Date().toISOString() })
    }
  }

  return (
    <div className={`border border-[#e5e5e5] border-l-4 ${accentClass} bg-white overflow-hidden`}>
      <div
        className={`px-3 py-2.5 flex items-center justify-between bg-[#1a1a1a] ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={handleToggle}
      >
        <h2 className="text-xs font-black text-white uppercase tracking-widest">{title}</h2>
        {collapsible && (
          <span className={`text-gray-400 text-xs transition-transform duration-150 ${open ? '' : '-rotate-90'}`}>
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
