// CRM Settings Tab
// Only Student Grouping (age buckets) - all other settings unsupported by backend

import { BarChart3 } from 'lucide-react'
import { AgeBucketEditor } from './AgeBucketEditor'

export function CRMSettingsTab() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-on-surface">CRM Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure student grouping options
        </p>
      </div>

      {/* Student Grouping Section - Only supported feature */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-medium text-on-surface">Student Grouping</h3>
            <p className="text-sm text-slate-500">Configure age buckets for grouping students in directory</p>
          </div>
        </div>

        <AgeBucketEditor />
      </section>
    </div>
  )
}
