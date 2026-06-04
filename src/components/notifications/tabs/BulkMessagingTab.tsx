// Bulk Messaging Tab
// Coming Soon placeholder

export function BulkMessagingTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-[6px] bg-secondary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-secondary">send</span>
      </div>
      <h3 className="font-headline text-lg font-semibold text-slate-700">Bulk Messaging</h3>
      <p className="font-body text-sm text-slate-500 text-center max-w-md">
        Send notifications to multiple recipients, verify drafts, and monitor delivery queues.
      </p>
      <span className="mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-[6px] uppercase tracking-wider">
        Status: Pipeline Inactive
      </span>
    </div>
  )
}
