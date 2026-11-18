import { createContext, useContext, useState, type ReactNode } from 'react'

export type EventType = 'CLICKED' | 'SEARCHED' | 'EXPANDED' | 'SCROLLED_PAST'

export interface BehaviorEvent {
  event: EventType
  item: string
  sport: string
  timestamp: string
}

interface EventContextValue {
  events: BehaviorEvent[]
  logEvent: (event: BehaviorEvent) => void
  clearEvents: () => void
}

const EventContext = createContext<EventContextValue>({
  events: [],
  logEvent: () => {},
  clearEvents: () => {},
})

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<BehaviorEvent[]>([])

  function logEvent(e: BehaviorEvent) {
    setEvents(prev => [e, ...prev])
  }

  function clearEvents() {
    setEvents([])
  }

  return (
    <EventContext.Provider value={{ events, logEvent, clearEvents }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  return useContext(EventContext)
}
