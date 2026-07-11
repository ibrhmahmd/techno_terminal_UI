import { useState, useRef, useEffect } from 'react'

interface SlideToConfirmProps {
  onConfirm: () => void
  label: string
}

export function SlideToConfirm({ onConfirm, label }: SlideToConfirmProps) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [dragX, setDragX] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)

  const handleStart = (clientX: number) => {
    if (isConfirmed) return
    isDragging.current = true
    startX.current = clientX - dragX
  }

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !trackRef.current) return
    const trackWidth = trackRef.current.clientWidth
    const handleWidth = 48 // thumb width
    const maxDrag = trackWidth - handleWidth - 8 // padding offset
    let newX = clientX - startX.current
    if (newX < 0) newX = 0
    if (newX > maxDrag) {
      newX = maxDrag
      isDragging.current = false
      setIsConfirmed(true)
      onConfirm()
    }
    setDragX(newX)
  }

  const handleEnd = () => {
    isDragging.current = false
    if (!isConfirmed) {
      // Spring back
      setDragX(0)
    }
  }

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current) {
        handleMove(e.touches[0].clientX)
      }
    }
    const onTouchEnd = () => handleEnd()

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleMove(e.clientX)
      }
    }
    const onMouseUp = () => handleEnd()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isConfirmed, dragX])

  return (
    <div
      ref={trackRef}
      className="relative h-14 bg-slate-100 border border-slate-200/80 rounded-full p-1 overflow-hidden select-none flex items-center justify-center w-full"
    >
      {/* Background text */}
      <span className="text-sm font-bold text-slate-400 pointer-events-none z-10 animate-pulse transition-opacity duration-200" style={{ opacity: dragX > 20 ? 0.3 : 1 }}>
        {label}
      </span>

      {/* Slide Fill Effect */}
      <div 
        className="absolute left-0 top-0 bottom-0 bg-secondary/15 transition-all duration-75 pointer-events-none"
        style={{ width: `${dragX + 24}px` }}
      />

      {/* Drag handle */}
      <div
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
        className={`absolute left-1 w-12 h-12 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md border ${
          isConfirmed 
            ? 'bg-emerald-600 border-emerald-500 text-white' 
            : 'bg-secondary border-secondary text-white hover:scale-102 active:scale-98'
        }`}
      >
        <span className="material-symbols-outlined text-xl select-none font-extrabold animate-pulse">
          {isConfirmed ? 'check' : 'chevron_right'}
        </span>
      </div>
    </div>
  )
}
