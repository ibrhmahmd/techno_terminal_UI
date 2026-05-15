export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-16" />
      </div>
      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
        <div className="h-8 bg-slate-200 rounded w-8" />
        <div className="h-8 bg-slate-200 rounded w-8" />
        <div className="h-8 bg-slate-200 rounded w-8" />
      </div>
    </div>
  )
}
