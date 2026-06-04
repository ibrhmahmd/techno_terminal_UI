import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_AGE_BUCKETS, type AgeBucket } from '../config/studentGrouping'

interface GroupingSettingsState {
  ageBuckets: AgeBucket[]
  addBucket: (bucket: AgeBucket) => void
  removeBucket: (key: string) => void
  resetToDefaults: () => void
}

export const useGroupingSettingsStore = create<GroupingSettingsState>()(
  persist(
    (set) => ({
      ageBuckets: DEFAULT_AGE_BUCKETS,

      addBucket: (bucket) =>
        set((state) => ({
          ageBuckets: [...state.ageBuckets, bucket].sort((a, b) => a.min - b.min),
        })),

      removeBucket: (key) =>
        set((state) => ({
          ageBuckets: state.ageBuckets.filter((b) => b.key !== key),
        })),

      resetToDefaults: () => set({ ageBuckets: DEFAULT_AGE_BUCKETS }),
    }),
    {
      name: 'grouping-settings-storage',
      version: 1,
    }
  )
)
