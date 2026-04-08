interface SuccessBannerProps {
  message: string
  actionText: string
  onAction?: () => void
}

export function SuccessBanner({ message, actionText, onAction }: SuccessBannerProps) {
  return (
    <div className="bg-teal-50 border border-teal-100 p-4 flex items-center justify-between">
      <div className="flex items-center text-teal-800 text-sm font-medium">
        <span className="mr-3 text-base">✨</span>
        <span>{message}</span>
      </div>
      <button 
        onClick={onAction}
        className="text-teal-600 text-xs font-bold uppercase tracking-widest hover:underline"
      >
        {actionText}
      </button>
    </div>
  )
}
