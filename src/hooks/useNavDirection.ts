import { useSettingsStore } from '../store/settingsStore'

/**
 * Returns the navigation direction based on the current locale direction.
 * In LTR: ArrowRight = forward (+1), ArrowLeft = backward (-1)
 * In RTL: ArrowRight = backward (-1), ArrowLeft = forward (+1)
 */
export function useNavDirection() {
  const locale = useSettingsStore((s) => s.locale)
  const isRTL = locale === 'ar'

  const getNextIndex = (e: React.KeyboardEvent, currentIndex: number, count: number): number | null => {
    if (e.key === 'ArrowRight') {
      return isRTL
        ? (currentIndex - 1 + count) % count
        : (currentIndex + 1) % count
    }
    if (e.key === 'ArrowLeft') {
      return isRTL
        ? (currentIndex + 1) % count
        : (currentIndex - 1 + count) % count
    }
    return null
  }

  return { isRTL, getNextIndex }
}
