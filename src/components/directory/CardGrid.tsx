import type { ReactNode } from 'react'

interface CardGridProps {
  children: ReactNode
  className?: string
}

export function CardGrid({ children, className = '' }: CardGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {children}
    </div>
  )
}
