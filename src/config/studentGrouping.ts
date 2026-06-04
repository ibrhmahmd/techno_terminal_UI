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
export type StudentGroupBy = 'none' | 'status' | 'age' | 'competition' | 'deleted'

// Group by options for waiting tab (no status option)
export type WaitingGroupBy = 'none' | 'age' | 'competition'

export interface GroupOption {
  value: string
  label: string
  icon: string
  disabled?: boolean
  accent?: 'red' | 'default'
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
 * Transform backend age group label to display format
 * Backend returns: "Ages 12 15", "Ages 15 Plus", "Ages 9 12", "Unknown"
 * Should display: "12-15", "15+", "9-12", "Unknown"
 */
export function formatAgeGroupLabel(backendLabel: string): string {
  if (backendLabel === 'Unknown') return 'Unknown'
  
  // Match patterns like "Ages 12 15" -> "12-15"
  const rangeMatch = backendLabel.match(/Ages\s+(\d+)\s+(\d+)/i)
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10)
    const max = parseInt(rangeMatch[2], 10)
    return `${min}-${max - 1}` // max is exclusive in buckets
  }
  
  // Match patterns like "Ages 15 Plus" -> "15+"
  const plusMatch = backendLabel.match(/Ages\s+(\d+)\s+Plus/i)
  if (plusMatch) {
    return `${plusMatch[1]}+`
  }
  
  // Fallback: remove "Ages " prefix if present
  return backendLabel.replace(/^Ages\s+/i, '')
}