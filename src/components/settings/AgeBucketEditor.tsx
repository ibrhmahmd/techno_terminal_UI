import { useState } from 'react'
import { Plus, Trash2, AlertCircle, RotateCcw } from 'lucide-react'
import { useGroupingSettingsStore } from '../../store/groupingSettingsStore'
import {
  DEFAULT_AGE_BUCKETS,
  validateAgeBuckets,
  type AgeBucket,
} from '../../config/studentGrouping'

export function AgeBucketEditor() {
  const { ageBuckets, addBucket, removeBucket, resetToDefaults } =
    useGroupingSettingsStore()
  const [newBucket, setNewBucket] = useState<Partial<AgeBucket>>({
    min: 0,
    max: 0,
    label: '',
    key: '',
  })
  const [errors, setErrors] = useState<string[]>([])

  const handleAddBucket = () => {
    if (!newBucket.label || newBucket.min === undefined || newBucket.max === undefined) {
      return
    }

    const bucket: AgeBucket = {
      min: newBucket.min,
      max: newBucket.max,
      label: newBucket.label,
      key: newBucket.key || `${newBucket.min}-${newBucket.max}`,
    }

    addBucket(bucket)
    setNewBucket({ min: 0, max: 0, label: '', key: '' })

    // Re-validate
    const newValidation = validateAgeBuckets([...ageBuckets, bucket])
    setErrors(newValidation.errors)
  }

  const handleRemoveBucket = (key: string) => {
    removeBucket(key)
    const newValidation = validateAgeBuckets(ageBuckets.filter((b) => b.key !== key))
    setErrors(newValidation.errors)
  }

  const handleReset = () => {
    resetToDefaults()
    const newValidation = validateAgeBuckets(DEFAULT_AGE_BUCKETS)
    setErrors(newValidation.errors)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-on-surface">Age Bucket Configuration</h3>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>

      <p className="text-sm text-slate-500">
        Define age ranges for grouping students. Buckets must not overlap and should cover all
        ages without gaps.
      </p>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium text-sm">Configuration Issues</span>
          </div>
          <ul className="text-sm text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Buckets */}
      <div className="space-y-2">
        {ageBuckets
          .slice()
          .sort((a, b) => a.min - b.min)
          .map((bucket) => (
            <div
              key={bucket.key}
              className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Min Age</label>
                  <p className="font-medium text-on-surface">{bucket.min}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Max Age</label>
                  <p className="font-medium text-on-surface">
                    {bucket.max >= 100 ? '∞' : bucket.max}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Label</label>
                  <p className="font-medium text-on-surface">{bucket.label}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveBucket(bucket.key)}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                title="Remove bucket"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
      </div>

      {/* Add New Bucket */}
      <div className="p-4 border border-slate-200 rounded-lg">
        <h4 className="text-sm font-medium text-on-surface mb-3">Add New Bucket</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Min Age</label>
            <input
              type="number"
              min="0"
              value={newBucket.min || ''}
              onChange={(e) =>
                setNewBucket((prev) => ({ ...prev, min: parseInt(e.target.value) || 0 }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Max Age</label>
            <input
              type="number"
              min="0"
              value={newBucket.max || ''}
              onChange={(e) =>
                setNewBucket((prev) => ({ ...prev, max: parseInt(e.target.value) || 0 }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              placeholder="7"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Label</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBucket.label || ''}
                onChange={(e) =>
                  setNewBucket((prev) => ({ ...prev, label: e.target.value }))
                }
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg"
                placeholder="e.g., Ages 4-6"
              />
              <button
                onClick={handleAddBucket}
                disabled={!newBucket.label || !newBucket.min || !newBucket.max}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Preview:</strong> Students will be grouped as:{' '}
          {ageBuckets
            .slice()
            .sort((a, b) => a.min - b.min)
            .map((b) => b.label)
            .join(', ')}
        </p>
      </div>
    </div>
  )
}
