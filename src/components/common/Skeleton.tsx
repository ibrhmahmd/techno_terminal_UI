interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-slate-200'

  const variantClasses = {
    text: 'rounded h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}
