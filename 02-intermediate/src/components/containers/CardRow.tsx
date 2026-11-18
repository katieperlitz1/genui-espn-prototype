import type { ReactNode } from 'react'

interface CardRowProps {
  columns?: number
  children: ReactNode
}

export function CardRow({ columns = 2, children }: CardRowProps) {
  const cols = columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
  return (
    <div className={`grid ${cols} gap-3`}>
      {children}
    </div>
  )
}
