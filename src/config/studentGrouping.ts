// Student Grouping Configuration
// Age buckets and grouping options for DirectoryPage

export interface AgeBucket {
  min: number // Inclusive
  max: number // Exclusive
  label: string // Display label
  key: string // URL-safe key
}

// Default age buckets as requested: 4-7, 7-9, 9-12, 12-15, 15+
export const DEFAULT_AGE_BUCKETS: AgeBucket[] = [
  { min: 4, max: 7, label: 'Ages 4-6', key: '4-7' },
  { min: 7, max: 9, label: 'Ages 7-8', key: '7-9' },
  { min: 9, max: 12, label: 'Ages 9-11', key: '9-12' },
  { min: 12, max: 15, label: 'Ages 12-14', key: '12-15' },
  { min: 15, max: 999, label: 'Ages 15+', key: '15-plus' },
]

// Group by options for students tab
export type StudentGroupBy = 'none' | 'status' | 'age' | 'competition'

// Group by options for waiting tab (no status option)
export type WaitingGroupBy = 'none' | 'age' | 'competition'

// Group by selector options
export const STUDENT_GROUP_OPTIONS = [
  { value: 'none' as const, label: 'All', icon: 'grid_view' },
  { value: 'status' as const, label: 'Status', icon: 'flag' },
  { value: 'age' as const, label: 'Age', icon: 'cake' },
  { value: 'competition' as const, label: 'Competition', icon: 'emoji_events', disabled: true },
]

export const WAITING_GROUP_OPTIONS = [
  { value: 'none' as const, label: 'All', icon: 'grid_view' },
  { value: 'age' as const, label: 'Age', icon: 'cake' },
  { value: 'competition' as const, label: 'Competition', icon: 'emoji_events', disabled: true },
]

export interface GroupOption {
  value: string
  label: string
  icon: string
  disabled?: boolean
}

/**
 * Validate age buckets for gaps and overlaps
 * Returns validation result with any errors
 */
export function validateAgeBuckets(buckets: AgeBucket[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (buckets.length === 0) {
    errors.push('At least one age bucket is required')
    return { valid: false, errors }
  }

  // Sort by min age
  const sorted = [...buckets].sort((a, b) => a.min - b.min)

  // Check first bucket starts at reasonable age
  if (sorted[0].min < 0) {
    errors.push('Minimum age cannot be negative')
  }

  // Check for gaps and overlaps between consecutive buckets
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]

    if (current.max !== next.min) {
      if (current.max > next.min) {
        errors.push(
          `Overlap between "${current.label}" and "${next.label}"`
        )
      } else {
        errors.push(
          `Gap between "${current.label}" (ends at ${current.max}) and "${next.label}" (starts at ${next.min})`
        )
      }
    }
  }

  // Check each bucket is valid
  sorted.forEach((bucket) => {
    if (bucket.min >= bucket.max) {
      errors.push(`"${bucket.label}": Min age must be less than max age`)
    }
    if (!bucket.label.trim()) {
      errors.push(`Bucket ${bucket.key} must have a label`)
    }
  })

  return { valid: errors.length === 0, errors }
}

/**
 * Get age bucket for a given age
 */
export function getAgeBucket(age: number, buckets: AgeBucket[]): AgeBucket | null {
  return buckets.find((b) => age >= b.min && age < b.max) || null
}

/**
 * Format age bucket for display
 */
export function formatAgeBucketLabel(bucket: AgeBucket): string {
  if (bucket.max >= 100) {
    return `${bucket.min}+`
  }
  return `${bucket.min}-${bucket.max - 1}`
}