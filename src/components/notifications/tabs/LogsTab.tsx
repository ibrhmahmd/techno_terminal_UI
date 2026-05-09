// Logs Tab
// Coming Soon placeholder

export function LogsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-orange-600">history</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-700">Notification Logs</h3>
      <p className="text-sm text-slate-500 text-center max-w-md">
        View history of sent notifications, delivery statuses, and retry failed messages.
      </p>
      <span className="mt-2 px-4 py-1.5 bg-slate-100 text-slate-500 text-sm font-medium rounded-full">
        Coming Soon
      </span>
    </div>
  )
}
